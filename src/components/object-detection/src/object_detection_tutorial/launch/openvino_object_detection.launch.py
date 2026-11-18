# Copyright (C) 2025 Intel Corporation
#
# SPDX-License-Identifier: Apache-2.0

import ctypes
import logging
import os
from pathlib import Path
import sys
from tempfile import NamedTemporaryFile

from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import (
    DeclareLaunchArgument,
    LogInfo,
    OpaqueFunction,
    SetEnvironmentVariable,
    Shutdown,
)
from launch_ros.actions import Node
import yaml

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
ROS_DISTRO_VERSION = os.environ.get('ROS_DISTRO', 'humble')  # Default to 'humble' if not set
HEADLESS_CHOICES = ('auto', 'true', 'false')
# device:=AUTO (the default): OpenVINO uses the GPU, and the CPU when no GPU is available. The
# NPU is left out on purpose: with the released openvino_wrapper_lib it returns no detections
# (issue #173).
AUTO_ENGINE = 'AUTO:GPU,CPU'
DETECTIONS_TOPIC = '/ros2_openvino_toolkit/detected_objects'


def display_available():
    """Return True if a Wayland or X11 display can be used for GUI windows."""
    if os.environ.get('WAYLAND_DISPLAY'):
        return True
    display = os.environ.get('DISPLAY')
    if not display:
        return False
    try:
        x11 = ctypes.CDLL('libX11.so.6')
    except OSError:
        return True  # libX11 is missing, so the display cannot be checked: trust DISPLAY
    x11.XOpenDisplay.argtypes = [ctypes.c_char_p]
    x11.XOpenDisplay.restype = ctypes.c_void_p
    handle = x11.XOpenDisplay(display.encode())
    if not handle:
        return False
    x11.XCloseDisplay.argtypes = [ctypes.c_void_p]
    x11.XCloseDisplay(handle)
    return True


def resolve_headless(choice, has_display):
    """Return (headless, error) for the headless launch argument."""
    choice = choice.lower()
    if choice not in HEADLESS_CHOICES:
        choices = ', '.join(HEADLESS_CHOICES)
        return None, f"Invalid headless value '{choice}'. Use one of: {choices}"
    if choice == 'auto':
        return not has_display, None
    if choice == 'false' and not has_display:
        return None, (
            'headless:=false, but no display is available (DISPLAY and WAYLAND_DISPLAY are unset '
            'or cannot be opened), so RViz cannot start. Use headless:=auto or headless:=true.'
        )
    return choice == 'true', None


def remove_rviz_output(pipeline):
    """Drop the RViz output, which opens a GUI window, from a pipeline config."""
    pipeline['outputs'] = [output for output in pipeline['outputs'] if output != 'RViz']
    for connection in pipeline.get('connects', []):
        connection['right'] = [target for target in connection['right'] if target != 'RViz']


def openvino_devices():
    """Return the devices OpenVINO can use, or None if they cannot be listed."""
    # Importing openvino loads its telemetry, whose sender can block when there is no internet
    # access; without the module, OpenVINO falls back to a no-op stub.
    sys.modules.setdefault('openvino_telemetry', None)
    try:
        import openvino
    except ImportError:
        return None
    return list(openvino.Core().available_devices)


def device_error(device, available, supported):
    """Return an error message if the device cannot be used, or None if it can."""
    if available is None:
        return None

    def present(name):
        return any(dev == name or dev.startswith(name + '.') for dev in available)

    usable = [dev for dev in supported if dev != 'AUTO' and present(dev)]
    if device in usable or (device == 'AUTO' and (present('GPU') or present('CPU'))):
        return None
    return (
        f"Device '{device}' is not available on this system. OpenVINO devices: "
        f"{', '.join(available) or 'none'}. Use device:=AUTO or one of: {', '.join(usable)}."
    )


def inference_engine(device):
    """Return the OpenVINO device string for the device launch argument."""
    return AUTO_ENGINE if device == 'AUTO' else device


def create_modified_yaml(device, headless=False):
    try:
        template_path = (
            Path(get_package_share_directory('object_detection_tutorial'))
            / 'param'
            / 'object_detection_pipeline.yaml'
        )

        # Get package share directory for dynamic path resolution
        package_share_dir = get_package_share_directory('object_detection_tutorial')

        with template_path.open('r') as file:
            config = yaml.safe_load(file)

        # Update paths dynamically using ROS package share directory
        pipeline = config['Pipelines'][0]
        pipeline['input_path'] = os.path.join(package_share_dir, 'image', 'coco_bike.jpg')
        pipeline['infers'][0]['label'] = os.path.join(package_share_dir, 'label', 'object.labels')
        pipeline['infers'][0]['engine'] = inference_engine(device)
        if headless:
            remove_rviz_output(pipeline)

        with NamedTemporaryFile(mode='w', delete=False, suffix='.yaml') as tmp_file:
            yaml.safe_dump(config, tmp_file)

        return tmp_file.name
    except FileNotFoundError as e:
        logger.error(f'Configuration file not found: {e}')
        sys.exit(1)

    except yaml.YAMLError as e:
        logger.error(f'Error parsing YAML file: {e}')
        sys.exit(1)


def generate_launch_description(*args, **kwargs):
    supported_devices = ['NPU', 'GPU', 'CPU', 'AUTO']

    ld_preload_action = None
    if ROS_DISTRO_VERSION == 'jazzy':
        ld_preload_action = SetEnvironmentVariable(
            name='LD_PRELOAD',
            value=(
                f'/opt/ros/{ROS_DISTRO_VERSION}/lib/libfastcdr.so:'
                f'/opt/ros/{ROS_DISTRO_VERSION}/lib/libfastrtps.so'
            ),
        )

    def launch_nodes(context, *args, **kwargs):
        selected_device = context.launch_configurations['device']

        # Check if the provided device is supported
        if selected_device not in supported_devices:
            logger.error(
                f"Error: Unsupported device \
                         '{selected_device}'. Supported devices are: \
                            {supported_devices}"
            )
            return [Shutdown(reason=f"Unsupported device '{selected_device}'")]

        available = openvino_devices()
        if available is None:
            logger.warning('Could not list OpenVINO devices; starting without a device check.')
        error = device_error(selected_device, available, supported_devices)
        if error:
            logger.error(error)
            return [Shutdown(reason=error)]

        headless, error = resolve_headless(
            context.launch_configurations['headless'], display_available()
        )
        if error:
            logger.error(error)
            return [Shutdown(reason=error)]

        modified_config_path = create_modified_yaml(selected_device, headless)
        device_log = LogInfo(
            msg=f'{selected_device} device selected for inference '
            f'(OpenVINO device: {inference_engine(selected_device)})'
        )

        default_rviz = os.path.join(
            get_package_share_directory('object_detection_tutorial'), 'rviz', 'default.rviz'
        )

        rviz_node = Node(
            package='rviz2',
            executable='rviz2',
            output='screen',
            arguments=['--display-config', default_rviz],
        )

        openvino_node = Node(
            package='openvino_node',
            executable='pipeline_with_params',
            name='pipeline_object',
            arguments=['-config', modified_config_path],
            remappings=[
                (
                    '/openvino_toolkit/object/detected_objects',
                    '/ros2_openvino_toolkit/detected_objects',
                ),
                ('/openvino_toolkit/object/images', '/ros2_openvino_toolkit/image_rviz'),
            ],
            output='screen',
            on_exit=Shutdown(reason='openvino_node exited'),
        )

        if headless:
            printer_node = Node(
                package='object_detection_tutorial',
                executable='print_detections.py',
                name='detection_printer',
                parameters=[{'topic': DETECTIONS_TOPIC}],
                output='screen',
            )
            return [
                device_log,
                LogInfo(msg='Headless mode: RViz is not started; detections are printed below.'),
                openvino_node,
                printer_node,
            ]
        return [device_log, openvino_node, rviz_node]

    return LaunchDescription(
        [
            DeclareLaunchArgument(
                'device',
                default_value='AUTO',
                description=(
                    'Inference device: AUTO (GPU if available, otherwise CPU), NPU, GPU, or CPU'
                ),
            ),
            DeclareLaunchArgument(
                'headless',
                default_value='auto',
                description=(
                    'Run without RViz and print detections to the terminal: auto (when no '
                    'display is available), true, or false'
                ),
            ),
            *([ld_preload_action] if ld_preload_action else []),
            OpaqueFunction(function=launch_nodes),
        ]
    )


if __name__ == '__main__':
    ld = generate_launch_description()
