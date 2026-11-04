#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
# Copyright (C) 2026 Intel Corporation

"""Launch Nav2 and ADBSCAN against a custom RGB-D Gazebo robot."""

import os
from functools import partial

from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import (
    DeclareLaunchArgument,
    ExecuteProcess,
    IncludeLaunchDescription,
    LogInfo,
    SetEnvironmentVariable,
)
from launch.conditions import IfCondition
from launch.event_handlers import OnProcessExit
from launch.actions import RegisterEventHandler
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration, PythonExpression
from launch_ros.actions import Node
from launch_ros.parameter_descriptions import ParameterValue


def actions_on_successful_exit(event, _context, actions):
    """Release dependent actions only when a readiness probe succeeds."""
    return actions if event.returncode == 0 else []


def generate_launch_description():  # pylint: disable=too-many-locals
    """Bring up a selectable SLAM backend with Nav2 and ADBSCAN perception."""
    bringup_dir = get_package_share_directory("wandering_bringup")
    nav2_dir = get_package_share_directory("nav2_bringup")

    use_sim_time = LaunchConfiguration("use_sim_time")
    slam_backend = LaunchConfiguration("slam_backend")
    params_file = LaunchConfiguration("params_file")
    fusion_params_file = LaunchConfiguration("fusion_params_file")
    adbscan_params_file = LaunchConfiguration("adbscan_params_file")
    simulator_launch_file = LaunchConfiguration("simulator_launch_file")
    start_simulator = LaunchConfiguration("start_simulator")
    start_rgbd_bridge = LaunchConfiguration("start_rgbd_bridge")
    start_wandering = LaunchConfiguration("start_wandering")
    use_rviz = LaunchConfiguration("use_rviz")
    gui = LaunchConfiguration("gui")
    namespace = LaunchConfiguration("namespace")
    scan_topic = LaunchConfiguration("scan_topic")
    rgb_topic = LaunchConfiguration("rgb_topic")
    rgb_camera_info_topic = LaunchConfiguration("rgb_camera_info_topic")
    aligned_depth_topic = LaunchConfiguration("aligned_depth_topic")
    cloud_topic = LaunchConfiguration("cloud_topic")
    subscribe_scan = LaunchConfiguration("subscribe_scan")

    default_params = os.path.join(bringup_dir, "params", "nav2_adbscan_sim.param.yaml")
    default_fusion = os.path.join(bringup_dir, "params", "pointcloud_fusion_rgbd_sim.yaml")
    default_adbscan = os.path.join(bringup_dir, "params", "adbscan_fused.yaml")
    default_simulator_launch = os.path.join(
        bringup_dir, "launch", "dep_wandering_rgbd_simulator.launch.py"
    )
    global_rviz_config = os.path.join(bringup_dir, "rviz", "adbscan_nav2_sim.rviz")
    local_rviz_config = os.path.join(bringup_dir, "rviz", "adbscan_nav2_sim_local_costmap.rviz")

    use_slam_toolbox = IfCondition(PythonExpression(["'", slam_backend, "' == 'slam_toolbox'"]))
    use_rtabmap = IfCondition(PythonExpression(["'", slam_backend, "' == 'rtabmap'"]))

    simulator = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(simulator_launch_file),
        condition=IfCondition(start_simulator),
        launch_arguments={"use_sim_time": use_sim_time, "gui": gui}.items(),
    )

    rgbd_bridge = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(bringup_dir, "launch", "dep_rgbd_camera_bridge.launch.py")
        ),
        condition=IfCondition(start_rgbd_bridge),
        launch_arguments={
            "use_sim_time": use_sim_time,
            "parent_frame": LaunchConfiguration("camera_parent_frame"),
            "optical_frame": LaunchConfiguration("camera_optical_frame"),
            "camera_x": LaunchConfiguration("camera_x"),
            "camera_y": LaunchConfiguration("camera_y"),
            "camera_z": LaunchConfiguration("camera_z"),
            "camera_roll": LaunchConfiguration("camera_roll"),
            "camera_pitch": LaunchConfiguration("camera_pitch"),
            "camera_yaw": LaunchConfiguration("camera_yaw"),
        }.items(),
    )

    wait_for_cloud = ExecuteProcess(
        cmd=[
            "ros2",
            "topic",
            "echo",
            "--qos-reliability",
            "best_effort",
            "--qos-durability",
            "volatile",
            cloud_topic,
            "sensor_msgs/msg/PointCloud2",
            "--once",
            "--field",
            "header",
        ],
        name="wait_for_rgbd_cloud",
        output="screen",
    )

    wait_for_map = ExecuteProcess(
        cmd=[
            "ros2",
            "topic",
            "echo",
            "--qos-reliability",
            "reliable",
            "--qos-durability",
            "transient_local",
            "/map",
            "nav_msgs/msg/OccupancyGrid",
            "--once",
            "--field",
            "info",
        ],
        name="wait_for_slam_map",
        output="screen",
    )

    slam_toolbox_nav2 = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(os.path.join(nav2_dir, "launch", "bringup_launch.py")),
        condition=use_slam_toolbox,
        launch_arguments={
            "use_sim_time": use_sim_time,
            "params_file": params_file,
            "autostart": "true",
            "slam": "True",
            "map": "",
        }.items(),
    )

    rgbd_sync = Node(
        package="rtabmap_sync",
        executable="rgbd_sync",
        name="rgbd_sync",
        condition=use_rtabmap,
        output="screen",
        parameters=[{"use_sim_time": use_sim_time, "approx_sync": True}],
        remappings=[
            ("rgb/image", rgb_topic),
            ("rgb/camera_info", rgb_camera_info_topic),
            ("depth/image", aligned_depth_topic),
            ("rgbd_image", "/camera/rgbd_image"),
        ],
    )

    depth_to_cloud = Node(
        package="depth_image_proc",
        executable="point_cloud_xyz_node",
        name="rgbd_point_cloud",
        output="screen",
        parameters=[{"use_sim_time": use_sim_time}],
        remappings=[
            ("image_rect", aligned_depth_topic),
            ("points", cloud_topic),
        ],
    )

    rtabmap = Node(
        package="rtabmap_slam",
        executable="rtabmap",
        name="rtabmap",
        condition=use_rtabmap,
        output="screen",
        arguments=["-d"],
        parameters=[
            {
                "use_sim_time": use_sim_time,
                "frame_id": "base_link",
                "odom_frame_id": "odom",
                "map_frame_id": "map",
                "publish_tf": True,
                "subscribe_depth": False,
                "subscribe_rgb": False,
                "subscribe_rgbd": True,
                "subscribe_scan": ParameterValue(subscribe_scan, value_type=bool),
                "rgbd_cameras": 1,
                "approx_sync": True,
                "Reg/Force3DoF": "true",
                "Grid/Sensor": "1",
            }
        ],
        remappings=[("rgbd_image", "/camera/rgbd_image"), ("scan", scan_topic)],
    )

    rtabmap_nav2 = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(os.path.join(nav2_dir, "launch", "navigation_launch.py")),
        condition=use_rtabmap,
        launch_arguments={
            "use_sim_time": use_sim_time,
            "params_file": params_file,
            "autostart": "true",
        }.items(),
    )

    perception = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(bringup_dir, "launch", "dep_adbscan_perception.launch.py")
        ),
        launch_arguments={
            "use_sim_time": use_sim_time,
            "fusion_params_file": fusion_params_file,
            "adbscan_params_file": adbscan_params_file,
            "namespace": namespace,
            "scan_topic": scan_topic,
            "cloud_topic": cloud_topic,
            "max_obstacle_extent": "1.5",
        }.items(),
    )

    wandering = Node(
        package="wandering_app",
        executable="wandering",
        name="wandering_mapper",
        condition=IfCondition(start_wandering),
        output="screen",
        parameters=[params_file, {"use_sim_time": use_sim_time}],
        remappings=[
            ("/tf", [namespace, "/tf"]),
            ("/tf_static", [namespace, "/tf_static"]),
        ],
    )

    global_rviz = Node(
        package="rviz2",
        executable="rviz2",
        name="rviz2_global",
        condition=IfCondition(use_rviz),
        arguments=["-d", global_rviz_config],
        parameters=[{"use_sim_time": use_sim_time}],
        output="screen",
    )

    local_rviz = Node(
        package="rviz2",
        executable="rviz2",
        name="rviz2_local",
        condition=IfCondition(use_rviz),
        arguments=["-d", local_rviz_config],
        parameters=[{"use_sim_time": use_sim_time}],
        output="screen",
    )

    rgb_image_view = Node(
        package="rqt_image_view",
        executable="rqt_image_view",
        name="rgb_image_view",
        condition=IfCondition(use_rviz),
        arguments=[rgb_topic],
        output="screen",
    )

    starting_message = LogInfo(
        msg="Starting Gazebo, robot interfaces, and RGB-D bridge. Waiting for the RGB-D cloud."
    )
    cloud_ready_message = LogInfo(
        msg="RGB-D cloud received. Starting SLAM, Nav2, and ADBSCAN perception."
    )
    map_ready_message = LogInfo(
        msg="Map received. Starting Wandering and visualization."
    )

    return LaunchDescription(
        [
            SetEnvironmentVariable("RMW_IMPLEMENTATION", "rmw_cyclonedds_cpp"),
            DeclareLaunchArgument("use_sim_time", default_value="true"),
            DeclareLaunchArgument(
                "slam_backend",
                default_value="rtabmap",
                choices=["slam_toolbox", "rtabmap"],
                description="SLAM implementation that owns map to odom TF",
            ),
            DeclareLaunchArgument("params_file", default_value=default_params),
            DeclareLaunchArgument("fusion_params_file", default_value=default_fusion),
            DeclareLaunchArgument("adbscan_params_file", default_value=default_adbscan),
            DeclareLaunchArgument(
                "start_simulator",
                default_value="true",
                description="Include simulator_launch_file for the custom RGB-D robot",
            ),
            DeclareLaunchArgument(
                "simulator_launch_file",
                default_value=default_simulator_launch,
                description="Absolute path to the custom RGB-D simulator launch file",
            ),
            DeclareLaunchArgument(
                "start_rgbd_bridge",
                default_value="true",
                description="Bridge the generic Gazebo RGB-D topic contract",
            ),
            DeclareLaunchArgument("start_wandering", default_value="true"),
            DeclareLaunchArgument("use_rviz", default_value="true"),
            DeclareLaunchArgument(
                "gui",
                default_value="false",
                description="Start the Gazebo graphical client",
            ),
            DeclareLaunchArgument("namespace", default_value=""),
            DeclareLaunchArgument("scan_topic", default_value="/scan"),
            DeclareLaunchArgument("rgb_topic", default_value="/camera/color/image_raw"),
            DeclareLaunchArgument(
                "rgb_camera_info_topic", default_value="/camera/color/camera_info"
            ),
            DeclareLaunchArgument(
                "aligned_depth_topic",
                default_value="/camera/aligned_depth_to_color/image_raw",
            ),
            DeclareLaunchArgument("cloud_topic", default_value="/camera/depth/color/points"),
            DeclareLaunchArgument("camera_parent_frame", default_value="base_link"),
            DeclareLaunchArgument(
                "camera_optical_frame", default_value="camera_rgb_optical_frame"
            ),
            DeclareLaunchArgument("camera_x", default_value="0.10"),
            DeclareLaunchArgument("camera_y", default_value="0.0"),
            DeclareLaunchArgument("camera_z", default_value="0.20"),
            DeclareLaunchArgument("camera_roll", default_value="-1.5708"),
            DeclareLaunchArgument("camera_pitch", default_value="0.0"),
            DeclareLaunchArgument("camera_yaw", default_value="-1.5708"),
            DeclareLaunchArgument(
                "subscribe_scan",
                default_value="false",
                description=(
                    "Fuse scan constraints into RTAB-Map when sensor timestamps are synchronized"
                ),
            ),
            starting_message,
            simulator,
            rgbd_bridge,
            rgbd_sync,
            depth_to_cloud,
            wait_for_cloud,
            RegisterEventHandler(
                OnProcessExit(
                    target_action=wait_for_cloud,
                    on_exit=partial(
                        actions_on_successful_exit,
                        actions=[
                            cloud_ready_message,
                            rtabmap,
                            slam_toolbox_nav2,
                            perception,
                            wait_for_map,
                            global_rviz,
                            local_rviz,
                            rgb_image_view,
                        ],
                    ),
                )
            ),
            RegisterEventHandler(
                OnProcessExit(
                    target_action=wait_for_map,
                    on_exit=partial(
                        actions_on_successful_exit,
                        actions=[
                            map_ready_message,
                            rtabmap_nav2,
                            wandering,
                        ],
                    ),
                )
            ),
        ]
    )
