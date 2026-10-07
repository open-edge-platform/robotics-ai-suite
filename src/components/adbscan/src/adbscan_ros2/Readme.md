<!--
Copyright (C) 2025 Intel Corporation

SPDX-License-Identifier: Apache-2.0
-->

# ADBSCAN ROS2 Node Documentation

## How to Build the ADBSCAN ROS2 Node Locally

To build the package, navigate to the `robotics-ai-suite/src/components/adbscan` directory and execute:

```bash
colcon build
```

## How to run the ADBSCAN ROS2 node

To set up the environment for running the ROS 2 nodes associated with the ADBSCAN package, please navigate to the following directory to source the `setup.bash` file: `src/components/adbscan/install/`

```bash
cd src/components/adbscan/install/
source setup.bash
```

For RealSense camera input, execute:

```bash
ros2 launch adbscan_ros2 play_demo_realsense_launch.py
```

For Lidar input, execute:

```bash
ros2 launch adbscan_ros2 play_demo_lidar_launch.py
```

## ADBSCAN ROS2 Node Input Description

The input data is passed into the ROS2 node through a ROS2 topic defined in the ROS2 configuration file by the parameter `Lidar_topic`. You can edit this parameter for a customized name.

The configuration files are located in the `src/components/adbscan/src/adbscan_ros2/config` directory.

- **2D Lidar Input**:
  - **File name**: `adbscan_sub_2D.yaml`
  - **Message type**: `sensor_msgs::msg::LaserScan`

- **3D Lidar Input**:
  - **File name**: `adbscan_sub_3D.yaml`
  - **Message type**: `sensor_msgs::msg::PointCloud2`

- **Realsense Input**:
  - **File name**: `adbscan_sub_RS.yaml`
  - **Message type**: `sensor_msgs::msg::PointCloud2`

## ADBSCAN ROS2 node output description

The output is published to the ROS2 topic `obstacle_array`, and the message format is `nav2_dynamic_msgs::msg::ObstacleArray`.

To view the messages being published to the `obstacle_array` topic, you can use the following command:

``` bash
ros2 topic echo /obstacle_array
```

## How to Visualize the Output in RViz

Launch RViz from a terminal:

```bash
rviz2
```

In RViz, add a new display by clicking on `Add` in the `Displays` panel. Select `MarkerArray` from the list of available display types.
