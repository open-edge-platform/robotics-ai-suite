# Copyright (C) 2025 Intel Corporation
#
# SPDX-License-Identifier: Apache-2.0

# https://docs.ros.org/en/humble/The-ROS2-Project/Contributing/Code-Style-Language-Versions.html#id5
cmake_minimum_required(VERSION 3.14.4)
project(nav2_bringup_collab)

list(APPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/../../../cmake")
include(ItsDebianPackaging)

find_package(ament_cmake REQUIRED)
find_package(nav2_common REQUIRED)
find_package(navigation2 REQUIRED)

nav2_package()

install(DIRECTORY launch DESTINATION share/${PROJECT_NAME})
install(DIRECTORY maps DESTINATION share/${PROJECT_NAME})
install(DIRECTORY rviz DESTINATION share/${PROJECT_NAME})
install(DIRECTORY worlds DESTINATION share/${PROJECT_NAME})
install(DIRECTORY params DESTINATION share/${PROJECT_NAME})
install(DIRECTORY urdf DESTINATION share/${PROJECT_NAME})

if(BUILD_TESTING)
  find_package(ament_lint_auto REQUIRED)
endif()

its_enable_debian_package(
  PACKAGE_BASENAME "nav2-bringup-collab"
  PACKAGE_DESCRIPTION "Bringup system for collaborative Nav2 applications"
  CHANGELOG_PATH "${CMAKE_CURRENT_SOURCE_DIR}/../${ROS_DISTRO}/debian/changelog"
  BUILD_DEPENDS
    "ros-${ROS_DISTRO}-ament-cmake"
    "ros-${ROS_DISTRO}-nav2-common"
    "ros-${ROS_DISTRO}-navigation2"
    "ros-${ROS_DISTRO}-slam-toolbox"
    "ros-${ROS_DISTRO}-launch-ros"
  PACKAGE_DEPENDS
    "ros-${ROS_DISTRO}-nav2-common"
    "ros-${ROS_DISTRO}-navigation2"
    "ros-${ROS_DISTRO}-slam-toolbox"
    "ros-${ROS_DISTRO}-launch-ros"
    "ros-${ROS_DISTRO}-robotics-sdk-license"
)

ament_package()
