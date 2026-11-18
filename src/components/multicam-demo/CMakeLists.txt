# Copyright (C) 2026 Intel Corporation
#
# SPDX-License-Identifier: Apache-2.0

cmake_minimum_required(VERSION 3.20)
project(realsense_d457_ai_demo_debian_packages NONE)

set(ROS_DISTRO "jazzy" CACHE STRING "ROS distribution to package for")
set(AI_DEMO_PACKAGE_OUTPUT_DIR "${CMAKE_BINARY_DIR}/packages" CACHE PATH "Directory for generated Debian packages")
set(AI_DEMO_PACKAGE_COMPONENTS "" CACHE STRING "Comma-separated src/ directories to package")
set(AI_DEMO_PACKAGE_VERSION_SUFFIX "" CACHE STRING "Optional suffix appended to Debian package versions")
set(AI_DEMO_BUILD_DEPENDS_OUTPUT_DIR "${CMAKE_BINARY_DIR}/debian-build-deps" CACHE PATH "Directory for generated Debian build dependency control files")

add_custom_target(package
  COMMAND "${CMAKE_COMMAND}"
    "-DROS_DISTRO=${ROS_DISTRO}"
    "-DAI_DEMO_SOURCE_DIR=${CMAKE_SOURCE_DIR}"
    "-DAI_DEMO_BUILD_DIR=${CMAKE_BINARY_DIR}"
    "-DAI_DEMO_GENERATOR=${CMAKE_GENERATOR}"
    "-DAI_DEMO_PACKAGE_OUTPUT_DIR=${AI_DEMO_PACKAGE_OUTPUT_DIR}"
    "-DAI_DEMO_PACKAGE_COMPONENTS=${AI_DEMO_PACKAGE_COMPONENTS}"
    "-DAI_DEMO_PACKAGE_VERSION_SUFFIX=${AI_DEMO_PACKAGE_VERSION_SUFFIX}"
    -P "${CMAKE_SOURCE_DIR}/cmake/PackageAll.cmake"
  USES_TERMINAL
  VERBATIM
  COMMENT "Building Debian packages for ${ROS_DISTRO}"
)

add_custom_target(debian-build-deps
  COMMAND "${CMAKE_COMMAND}"
    "-DROS_DISTRO=${ROS_DISTRO}"
    "-DAI_DEMO_SOURCE_DIR=${CMAKE_SOURCE_DIR}"
    "-DAI_DEMO_BUILD_DEPENDS_OUTPUT_DIR=${AI_DEMO_BUILD_DEPENDS_OUTPUT_DIR}"
    "-DAI_DEMO_PACKAGE_COMPONENTS=${AI_DEMO_PACKAGE_COMPONENTS}"
    -P "${CMAKE_SOURCE_DIR}/cmake/GenerateDebianBuildDepends.cmake"
  USES_TERMINAL
  VERBATIM
  COMMENT "Generating Debian build dependency control files for ${ROS_DISTRO}"
)
