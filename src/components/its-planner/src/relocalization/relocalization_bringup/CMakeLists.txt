# Copyright (C) 2025 Intel Corporation
#
# SPDX-License-Identifier: Apache-2.0

# https://docs.ros.org/en/humble/The-ROS2-Project/Contributing/Code-Style-Language-Versions.html#id5
cmake_minimum_required(VERSION 3.14.4)
project(relocalization_bringup)

list(APPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/../../../cmake")
include(ItsDebianPackaging)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# find dependencies
find_package(ament_cmake REQUIRED)

install(DIRECTORY
  launch
  DESTINATION share/${PROJECT_NAME})

install(FILES saved_poses.txt
  DESTINATION share/${PROJECT_NAME})

its_enable_debian_package(
  PACKAGE_BASENAME "its-relocalization-bringup"
  PACKAGE_DESCRIPTION "Relocalization bringup package"
  CHANGELOG_PATH "${CMAKE_CURRENT_SOURCE_DIR}/../${ROS_DISTRO}/debian/changelog"
  BUILD_DEPENDS
    "ros-${ROS_DISTRO}-ament-cmake"
    "ros-${ROS_DISTRO}-rcl"
    "ros-${ROS_DISTRO}-rclcpp"
    "ros-${ROS_DISTRO}-navigation2"
    "ros-${ROS_DISTRO}-turtlebot3"
  PACKAGE_DEPENDS
    "ros-${ROS_DISTRO}-rcl"
    "ros-${ROS_DISTRO}-rclcpp"
    "ros-${ROS_DISTRO}-navigation2"
    "ros-${ROS_DISTRO}-turtlebot3"
    "ros-${ROS_DISTRO}-its-pose-checker"
    "ros-${ROS_DISTRO}-its-reloc-benchmarking"
    "ros-${ROS_DISTRO}-its-send-localization"
    "ros-${ROS_DISTRO}-robotics-sdk-license"
)

ament_package()
