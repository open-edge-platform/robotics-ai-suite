# Copyright (C) 2026 Intel Corporation
#
# SPDX-License-Identifier: Apache-2.0

foreach(required_variable IN ITEMS ROS_DISTRO OBJECTDETECTION_SOURCE_DIR OBJECTDETECTION_BUILD_DIR OBJECTDETECTION_PACKAGE_OUTPUT_DIR OBJECTDETECTION_PACKAGE_COMPONENTS)
  if(NOT DEFINED ${required_variable} OR "${${required_variable}}" STREQUAL "")
    message(FATAL_ERROR "${required_variable} is required")
  endif()
endforeach()

file(MAKE_DIRECTORY "${OBJECTDETECTION_PACKAGE_OUTPUT_DIR}")
string(REPLACE "," ";" OBJECTDETECTION_CMAKE_PACKAGES "${OBJECTDETECTION_PACKAGE_COMPONENTS}")

# Shared staging prefix so later components (e.g. yolo) can find the CMake config
# packages of earlier components (e.g. yolo_msgs) without them being installed
# system-wide.
set(staging_prefix "${OBJECTDETECTION_BUILD_DIR}/install")
file(MAKE_DIRECTORY "${staging_prefix}")

if(DEFINED ENV{AMENT_PREFIX_PATH} AND NOT "$ENV{AMENT_PREFIX_PATH}" STREQUAL "")
  set(ament_prefix_path "${staging_prefix}:$ENV{AMENT_PREFIX_PATH}")
else()
  set(ament_prefix_path "${staging_prefix}")
endif()

foreach(component IN LISTS OBJECTDETECTION_CMAKE_PACKAGES)
  set(package_source_dir "${OBJECTDETECTION_SOURCE_DIR}/src/${component}")
  set(package_build_dir "${OBJECTDETECTION_BUILD_DIR}/${component}")
  if(NOT EXISTS "${package_source_dir}/CMakeLists.txt")
    message(FATAL_ERROR "Package source directory not found: ${package_source_dir}")
  endif()

  message(STATUS "Packaging ${component}")

  execute_process(
    COMMAND "${CMAKE_COMMAND}" -E env "AMENT_PREFIX_PATH=${ament_prefix_path}"
      "${CMAKE_COMMAND}" -G Ninja -S "${package_source_dir}" -B "${package_build_dir}"
      -DROS_DISTRO=${ROS_DISTRO}
      -DBUILD_TESTING=OFF
      -DCMAKE_PREFIX_PATH=${staging_prefix}
      -DOBJECTDETECTION_PACKAGE_VERSION_SUFFIX=${OBJECTDETECTION_PACKAGE_VERSION_SUFFIX}
      -DPACKAGE_VERSION_SUFFIX=${OBJECTDETECTION_PACKAGE_VERSION_SUFFIX}
    COMMAND_ERROR_IS_FATAL ANY
  )
  execute_process(
    COMMAND "${CMAKE_COMMAND}" --build "${package_build_dir}" --parallel
    COMMAND_ERROR_IS_FATAL ANY
  )
  # Stage into the shared prefix so dependent components resolve this one.
  execute_process(
    COMMAND "${CMAKE_COMMAND}" --install "${package_build_dir}" --prefix "${staging_prefix}"
    COMMAND_ERROR_IS_FATAL ANY
  )
  execute_process(
    COMMAND cpack --config "${package_build_dir}/CPackConfig.cmake" -G DEB -B "${OBJECTDETECTION_PACKAGE_OUTPUT_DIR}"
    COMMAND_ERROR_IS_FATAL ANY
  )
endforeach()
