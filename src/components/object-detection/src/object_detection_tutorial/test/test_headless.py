# Copyright (C) 2026 Intel Corporation
#
# SPDX-License-Identifier: Apache-2.0

import ctypes
import importlib.util
from pathlib import Path

import pytest
import yaml

PACKAGE_DIR = Path(__file__).resolve().parents[1]


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


launch = load('od_launch', PACKAGE_DIR / 'launch' / 'openvino_object_detection.launch.py')
printer = load('print_detections', PACKAGE_DIR / 'scripts' / 'print_detections.py')


def pipeline_config():
    with (PACKAGE_DIR / 'param' / 'object_detection_pipeline.yaml').open() as file:
        return yaml.safe_load(file)['Pipelines'][0]


def test_remove_rviz_output():
    pipeline = pipeline_config()
    assert 'RViz' in pipeline['outputs']
    launch.remove_rviz_output(pipeline)
    assert pipeline['outputs'] == ['RosTopic']
    assert all('RViz' not in connection['right'] for connection in pipeline['connects'])
    assert {'left': 'Image', 'right': ['ObjectDetection']} in pipeline['connects']


@pytest.mark.parametrize('choice, has_display, headless', [
    ('auto', False, True),
    ('auto', True, False),
    ('AUTO', False, True),
    ('true', True, True),
    ('true', False, True),
    ('false', True, False),
])
def test_resolve_headless(choice, has_display, headless):
    assert launch.resolve_headless(choice, has_display) == (headless, None)


@pytest.mark.parametrize('choice, has_display, message', [
    ('false', False, 'no display is available'),
    ('maybe', True, 'Invalid headless value'),
])
def test_resolve_headless_errors(choice, has_display, message):
    headless, error = launch.resolve_headless(choice, has_display)
    assert headless is None
    assert message in error


def test_display_available_without_display(monkeypatch):
    monkeypatch.delenv('DISPLAY', raising=False)
    monkeypatch.delenv('WAYLAND_DISPLAY', raising=False)
    assert launch.display_available() is False


def test_display_available_with_wayland(monkeypatch):
    monkeypatch.delenv('DISPLAY', raising=False)
    monkeypatch.setenv('WAYLAND_DISPLAY', 'wayland-0')
    assert launch.display_available() is True


def test_display_available_with_unreachable_x_display(monkeypatch):
    try:
        ctypes.CDLL('libX11.so.6')
    except OSError:
        pytest.skip('libX11 is not installed')
    monkeypatch.delenv('WAYLAND_DISPLAY', raising=False)
    monkeypatch.setenv('DISPLAY', ':4242')
    assert launch.display_available() is False


def test_summarize():
    objects = [('car', 0.84), ('bicycle', 0.66), ('parking', 0.75)]
    assert printer.summarize(objects) == 'car 0.84, parking 0.75, bicycle 0.66'
    assert printer.summarize([]) == 'no objects'
    assert printer.summarize(objects, limit=2) == 'car 0.84, parking 0.75, ... (3 objects)'


def test_launch_argument_defaults():
    description = launch.generate_launch_description()
    arguments = {arg.name: arg for arg in description.get_launch_arguments()}
    assert set(arguments) >= {'device', 'headless'}
    assert [part.text for part in arguments['device'].default_value] == ['AUTO']
    assert [part.text for part in arguments['headless'].default_value] == ['auto']


@pytest.mark.parametrize('device, engine', [
    ('AUTO', 'AUTO:GPU,CPU'),
    ('GPU', 'GPU'),
    ('CPU', 'CPU'),
])
def test_inference_engine(device, engine):
    assert launch.inference_engine(device) == engine


@pytest.mark.parametrize('device, available', [
    ('AUTO', ['CPU']),
    ('AUTO', ['CPU', 'GPU']),
    ('GPU', ['CPU', 'GPU']),
    ('GPU', ['CPU', 'GPU.0', 'GPU.1']),
    ('NPU', ['CPU', 'NPU']),
    ('CPU', ['CPU']),
    ('GPU', None),
])
def test_device_usable(device, available):
    assert launch.device_error(device, available, ['NPU', 'GPU', 'CPU', 'AUTO']) is None


def test_device_not_available_lists_devices():
    error = launch.device_error('GPU', ['CPU', 'NPU'], ['NPU', 'GPU', 'CPU', 'AUTO'])
    assert "Device 'GPU' is not available" in error
    assert 'OpenVINO devices: CPU, NPU.' in error
    assert 'Use device:=AUTO or one of: NPU, CPU.' in error


def test_openvino_devices():
    devices = launch.openvino_devices()
    assert devices is None or 'CPU' in devices
