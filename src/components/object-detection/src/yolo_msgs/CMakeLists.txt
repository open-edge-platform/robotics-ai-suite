# Copyright (C) 2025 Intel Corporation
#
# SPDX-License-Identifier: Apache-2.0

cmake_minimum_required(VERSION 3.8)
project(yolo_msgs)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# find dependencies
find_package(ament_cmake REQUIRED)
find_package(std_msgs REQUIRED)
find_package(sensor_msgs REQUIRED)
find_package(tf2_msgs REQUIRED)
# uncomment the following section in order to fill in
# further dependencies manually.
# find_package(<dependency> REQUIRED)

find_package(rosidl_default_generators REQUIRED)

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
endif()

rosidl_generate_interfaces(${PROJECT_NAME}
  "msg/YoloDetection.msg"
  "msg/YoloFrame.msg"
  DEPENDENCIES geometry_msgs sensor_msgs std_msgs tf2_msgs
  # Add packages that above messages depend on, in this case geometry_msgs for Sphere.msg
)

ament_package()

include(${CMAKE_CURRENT_SOURCE_DIR}/../../cmake/RosDebianPackage.cmake)
configure_ros_debian_package_with_metadata(
  PACKAGE_NAME "ros-${ROS_DISTRO}-openvino-yolov8-msgs"
  DESCRIPTION "Yolov8 Openvino ROS2 Harness Messages"
  CONTACT "ECI Maintainer <eci.maintainer@intel.com>"
  BUILD_DEPENDS
    "cmake"
    "ros-${ROS_DISTRO}-ament-cmake"
    "ros-${ROS_DISTRO}-ament-lint-common"
    "ros-${ROS_DISTRO}-rosidl-default-generators"
    "ros-${ROS_DISTRO}-std-msgs"
    "ros-${ROS_DISTRO}-tf2-msgs"
    "ros-${ROS_DISTRO}-sensor-msgs"
  DEPENDS
    "ros-${ROS_DISTRO}-rosidl-default-runtime"
    "ros-${ROS_DISTRO}-std-msgs"
    "ros-${ROS_DISTRO}-tf2-msgs"
    "ros-${ROS_DISTRO}-sensor-msgs"
)
