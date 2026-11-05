# Copyright (C) 2025 Intel Corporation
#
# SPDX-License-Identifier: Apache-2.0

cmake_minimum_required(VERSION 3.8)
project(object_detection_tutorial)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# find dependencies
find_package(ament_cmake REQUIRED)
# uncomment the following section in order to fill in
# further dependencies manually.
# find_package(<dependency> REQUIRED)

# Install launch files.
install(DIRECTORY
  launch
  label
  param
  image
  rviz
  DESTINATION share/${PROJECT_NAME}/
  USE_SOURCE_PERMISSIONS
)
install(PROGRAMS scripts/print_detections.py DESTINATION lib/${PROJECT_NAME})

if(BUILD_TESTING)
  find_package(ament_lint_auto REQUIRED)
  # the following line skips the linter which checks for copyrights
  # comment the line when a copyright and license is added to all source files
  set(ament_cmake_copyright_FOUND TRUE)
  # the following line skips cpplint (only works in a git repo)
  # comment the line when this package is in a git repo and when
  # a copyright and license is added to all source files
  set(ament_cmake_cpplint_FOUND TRUE)
  ament_lint_auto_find_test_dependencies()
  find_package(ament_cmake_pytest REQUIRED)
  ament_add_pytest_test(test_headless test/test_headless.py)
endif()

ament_package()

include(${CMAKE_CURRENT_SOURCE_DIR}/../../cmake/RosDebianPackage.cmake)
configure_ros_debian_package_with_metadata(
  PACKAGE_NAME "ros-${ROS_DISTRO}-object-detection-tutorial"
  DESCRIPTION "Example tutorial for Openvino Object detection using GPU/NPU acceleration"
  CONTACT "ECI Maintainer <eci.maintainer@intel.com>"
  BUILD_DEPENDS
    "cmake"
    "ros-${ROS_DISTRO}-ament-cmake"
    "ros-${ROS_DISTRO}-ament-lint-auto"
    "ros-${ROS_DISTRO}-ament-lint-common"
    "ros-${ROS_DISTRO}-ament-cmake-pytest"
    "ros-${ROS_DISTRO}-ament-index-python"
    "ros-${ROS_DISTRO}-launch-ros"
    "ros-${ROS_DISTRO}-object-msgs"
    "ros-${ROS_DISTRO}-rclpy"
    "python3-pytest"
    "python3-yaml"
  DEPENDS
    "ros-${ROS_DISTRO}-openvino-node"
    "ros-${ROS_DISTRO}-object-msgs"
    "ros-${ROS_DISTRO}-rclpy"
    "ros-${ROS_DISTRO}-launch-ros"
    "python3-yaml"
)
