# Copyright (C) 2026 Intel Corporation
#
# SPDX-License-Identifier: Apache-2.0

cmake_minimum_required(VERSION 3.16)
project(objectdetection_debian_packages NONE)

set(ROS_DISTRO "jazzy" CACHE STRING "ROS distribution to package")
set(OBJECTDETECTION_PACKAGE_OUTPUT_DIR "${CMAKE_BINARY_DIR}/packages" CACHE PATH "Directory for generated Debian packages")
set(OBJECTDETECTION_PACKAGE_COMPONENTS "" CACHE STRING "Comma-separated source directories to package")
set(OBJECTDETECTION_PACKAGE_VERSION_SUFFIX "" CACHE STRING "Optional suffix appended to Debian package versions")
set(OBJECTDETECTION_BUILD_DEPENDS_OUTPUT_DIR "${CMAKE_BINARY_DIR}/debian-build-deps" CACHE PATH "Directory for generated Debian build dependency control files")

add_custom_target(package
  COMMAND ${CMAKE_COMMAND}
    -DROS_DISTRO=${ROS_DISTRO}
    -DOBJECTDETECTION_SOURCE_DIR=${CMAKE_SOURCE_DIR}
    -DOBJECTDETECTION_BUILD_DIR=${CMAKE_BINARY_DIR}
    -DOBJECTDETECTION_PACKAGE_OUTPUT_DIR=${OBJECTDETECTION_PACKAGE_OUTPUT_DIR}
    "-DOBJECTDETECTION_PACKAGE_COMPONENTS=${OBJECTDETECTION_PACKAGE_COMPONENTS}"
    -DOBJECTDETECTION_PACKAGE_VERSION_SUFFIX=${OBJECTDETECTION_PACKAGE_VERSION_SUFFIX}
    -P ${CMAKE_SOURCE_DIR}/cmake/PackageAll.cmake
  USES_TERMINAL
  COMMENT "Building native Debian packages for ${ROS_DISTRO}"
)

add_custom_target(debian-build-deps
  COMMAND ${CMAKE_COMMAND}
    -DROS_DISTRO=${ROS_DISTRO}
    -DOBJECTDETECTION_SOURCE_DIR=${CMAKE_SOURCE_DIR}
    -DOBJECTDETECTION_BUILD_DEPENDS_OUTPUT_DIR=${OBJECTDETECTION_BUILD_DEPENDS_OUTPUT_DIR}
    "-DOBJECTDETECTION_PACKAGE_COMPONENTS=${OBJECTDETECTION_PACKAGE_COMPONENTS}"
    -P ${CMAKE_SOURCE_DIR}/cmake/GenerateDebianBuildDepends.cmake
  USES_TERMINAL
  COMMENT "Generating Debian build dependency control files for ${ROS_DISTRO}"
)
