<!--
Copyright (C) 2025 Intel Corporation

SPDX-License-Identifier: Apache-2.0
-->

# OpenVINO™ Tutorial with Segmentation

---

This tutorial demonstrates semantic segmentation with the ROS 2
OpenVINO™ node. It explains how to install the node and run a model using
images from an Intel® RealSense™ camera. Inference can run on a CPU or
GPU.

## Prerequisites

- [Prepare the target system](https://developer.robotics.intel.com/development-stack/platform_foundation/getting_started/)
- [Setup the Robotics AI Dev Kit APT Repositories](https://developer.robotics.intel.com/development-stack/platform_foundation/getting_started/step_by_step/#3-set-up-robotics-ai-suite-oneapi-and-graphics-apt-repositories)
- [Install OpenVINO™ Packages](https://developer.robotics.intel.com/development-stack/platform_foundation/getting_started/step_by_step/#4-install-openvino-packages)
- [Install Robotics AI Dev Kit Deb packages](https://developer.robotics.intel.com/development-stack/platform_foundation/getting_started/step_by_step/#6-install-robotics-ai-suite-deb-packages)
- [Install the Intel® NPU Driver on Intel® Core™ Ultra Processors (if applicable)](https://developer.robotics.intel.com/development-stack/platform_foundation/getting_started/step_by_step/#7-install-the-intel-npu-driver-on-intel-core-ultra-processors)

## Install the tutorial package

```bash
sudo apt install ros-humble-segmentation-realsense-tutorial
```

For ROS 2 Jazzy, replace `humble` in the package name with `jazzy`.

## Run the Demo with Intel® RealSense™ Image Topics

Run the following command to launch the segmentation tutorial. By
default it runs on the GPU, and on the CPU when no GPU is available:

```bash
ros2 launch segmentation_realsense_tutorial openvino_segmentation.launch.py
```

To select the inference engine, add the `device` argument:

- GPU inference engine

  ```bash
  ros2 launch segmentation_realsense_tutorial openvino_segmentation.launch.py device:=GPU
  ```

- CPU inference engine

  ```bash
  ros2 launch segmentation_realsense_tutorial openvino_segmentation.launch.py device:=CPU
  ```

> [!NOTE]
> The default, `device:=AUTO`, uses OpenVINO's automatic device
> selection (`AUTO:GPU,CPU`). If the selected device is not available,
> the tutorial stops and lists the devices OpenVINO can use.

When launched, the node downloads the `deeplabv3` model, converts it to
OpenVINO IR format, and begins inference on images from the Intel®
RealSense™ camera.

## Run without a display

On a system without a display, for example over SSH, the launch file
runs in headless mode and does not start RViz. The `headless` launch
argument controls this:

- `headless:=auto` (default): headless when neither `DISPLAY` nor
  `WAYLAND_DISPLAY` is set, or the X display cannot be opened
- `headless:=true`: always headless, even with a display
- `headless:=false`: always start RViz; stops with an error when no
  display is available

To see the segmentation results in headless mode, run:

```bash
ros2 topic echo /ros2_openvino_toolkit/segmented_obejcts | grep -E "object_name|probability"
```

To stop the application, press `Ctrl+C` in the terminal running the
launch command.
