# Copyright (C) 2026 Intel Corporation
#
# SPDX-License-Identifier: Apache-2.0

import importlib.util
from pathlib import Path

import pytest
import yaml

PACKAGE_DIR = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location(
    'seg_launch', PACKAGE_DIR / 'launch' / 'openvino_segmentation.launch.py'
)
launch = importlib.util.module_from_spec(spec)
spec.loader.exec_module(launch)


def test_remove_rviz_output():
    with (PACKAGE_DIR / 'param' / 'object_segmentation_pipeline.yaml').open() as file:
        pipeline = yaml.safe_load(file)['Pipelines'][0]
    assert 'RViz' in pipeline['outputs']
    launch.remove_rviz_output(pipeline)
    assert pipeline['outputs'] == ['RosTopic']
    assert all('RViz' not in connection['right'] for connection in pipeline['connects'])
    camera_to_model = {'left': 'RealSenseCameraTopic', 'right': ['ObjectSegmentation']}
    assert camera_to_model in pipeline['connects']


@pytest.mark.parametrize('choice, has_display, expected', [
    ('auto', False, (True, None)),
    ('auto', True, (False, None)),
    ('true', True, (True, None)),
    ('false', True, (False, None)),
])
def test_resolve_headless(choice, has_display, expected):
    assert launch.resolve_headless(choice, has_display) == expected


def test_resolve_headless_false_without_display():
    headless, error = launch.resolve_headless('false', False)
    assert headless is None
    assert 'no display is available' in error


def test_display_available_without_display(monkeypatch):
    monkeypatch.delenv('DISPLAY', raising=False)
    monkeypatch.delenv('WAYLAND_DISPLAY', raising=False)
    assert launch.display_available() is False


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


def test_device_not_available_lists_devices():
    error = launch.device_error('GPU', ['CPU', 'NPU'], ['GPU', 'CPU', 'AUTO'])
    assert "Device 'GPU' is not available" in error
    assert 'OpenVINO devices: CPU, NPU.' in error
    assert 'Use device:=AUTO or one of: CPU.' in error


@pytest.mark.parametrize('device, available', [
    ('AUTO', ['CPU']),
    ('GPU', ['CPU', 'GPU']),
    ('CPU', None),
])
def test_device_usable(device, available):
    assert launch.device_error(device, available, ['GPU', 'CPU', 'AUTO']) is None
