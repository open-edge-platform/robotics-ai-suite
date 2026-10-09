<!--
Copyright (C) 2025 Intel Corporation

SPDX-License-Identifier: Apache-2.0
-->

# Enable Collaborative Visual SLAM Framework on ROS2 Navigation

You can get the Collaborative Visual SLAM Framework from the [Collaborative SLAM (CSLAM)](https://github.com/open-edge-platform/robotics-ai-suite/tree/main/src/components/collaborative-slam) section and an ITS Planner integration files for ROS 2 Navigation, in the [Enable Collaborative Visual SLAM Framework on ROS2 Navigation](https://github.com/open-edge-platform/robotics-ai-suite/tree/main/src/components/its-planner/src/collab_slam) section.

The following are instructions to enable the Collaborative Visual SLAM Framework on the ROS2 Navigation package:

1. Get the Collaborative Visual SLAM code

    `git clone --recursive https://github.com/open-edge-platform/edge-ai-suites -b main`

2. Build the collaborative VSLAM, nav2_bringup and the ITS planner

    `source /opt/ros/humble/setup.bash`

    `colcon build`

    `source install/setup.bash`

3. Run the Collab SLAM ROS2 Navigation

    To run in the localization mode: `./run_collab.sh localization`

    To run in the mapping mode: `./run_collab.sh mapping`