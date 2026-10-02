# Copyright (C) 2026 Intel Corporation
#
# SPDX-License-Identifier: Apache-2.0

cmake_minimum_required(VERSION 3.16)
project(its_planner_debian_packages NONE)

set(ROS_DISTRO "jazzy" CACHE STRING "ROS distribution to package")
set(ITSPLANNER_PACKAGE_OUTPUT_DIR "${CMAKE_BINARY_DIR}/packages" CACHE PATH "Directory for generated Debian packages")
set(ITSPLANNER_PACKAGE_COMPONENTS "" CACHE STRING "Comma-separated source directories to package")
set(ITSPLANNER_PACKAGE_VERSION_SUFFIX "" CACHE STRING "Optional suffix appended to Debian package versions")
set(ITSPLANNER_BUILD_DEPENDS_OUTPUT_DIR "${CMAKE_BINARY_DIR}/debian-build-deps" CACHE PATH "Directory for generated Debian build dependency control files")
set(ITSPLANNER_CMAKE_GENERATOR "Ninja" CACHE STRING "CMake generator used when configuring component package builds")

add_custom_target(package
  COMMAND ${CMAKE_COMMAND}
    -DROS_DISTRO=${ROS_DISTRO}
    -DITSPLANNER_SOURCE_DIR=${CMAKE_SOURCE_DIR}
    -DITSPLANNER_BUILD_DIR=${CMAKE_BINARY_DIR}
    -DITSPLANNER_PACKAGE_OUTPUT_DIR=${ITSPLANNER_PACKAGE_OUTPUT_DIR}
    "-DITSPLANNER_PACKAGE_COMPONENTS=${ITSPLANNER_PACKAGE_COMPONENTS}"
    -DITSPLANNER_PACKAGE_VERSION_SUFFIX=${ITSPLANNER_PACKAGE_VERSION_SUFFIX}
    "-DITSPLANNER_CMAKE_GENERATOR=${ITSPLANNER_CMAKE_GENERATOR}"
    -P ${CMAKE_SOURCE_DIR}/cmake/PackageAll.cmake
  USES_TERMINAL
  COMMENT "Building native Debian packages for ${ROS_DISTRO}"
)

add_custom_target(debian-build-deps
  COMMAND ${CMAKE_COMMAND}
    -DROS_DISTRO=${ROS_DISTRO}
    -DITSPLANNER_SOURCE_DIR=${CMAKE_SOURCE_DIR}
    -DITSPLANNER_BUILD_DEPENDS_OUTPUT_DIR=${ITSPLANNER_BUILD_DEPENDS_OUTPUT_DIR}
    "-DITSPLANNER_PACKAGE_COMPONENTS=${ITSPLANNER_PACKAGE_COMPONENTS}"
    -P ${CMAKE_SOURCE_DIR}/cmake/GenerateDebianBuildDepends.cmake
  USES_TERMINAL
  COMMENT "Generating Debian build dependency control files for ${ROS_DISTRO}"
)
