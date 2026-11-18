# Copyright (C) 2026 Intel Corporation
#
# SPDX-License-Identifier: Apache-2.0

foreach(required_variable IN ITEMS ROS_DISTRO SIMULATIONS_SOURCE_DIR SIMULATIONS_BUILD_DIR SIMULATIONS_PACKAGE_OUTPUT_DIR SIMULATIONS_PACKAGE_COMPONENTS)
  if(NOT DEFINED ${required_variable} OR "${${required_variable}}" STREQUAL "")
    message(FATAL_ERROR "${required_variable} is required")
  endif()
endforeach()

if(NOT DEFINED SIMULATIONS_CMAKE_GENERATOR OR "${SIMULATIONS_CMAKE_GENERATOR}" STREQUAL "")
  set(SIMULATIONS_CMAKE_GENERATOR "Ninja")
endif()

file(MAKE_DIRECTORY "${SIMULATIONS_PACKAGE_OUTPUT_DIR}")
string(REPLACE "," ";" SIMULATIONS_CMAKE_PACKAGES "${SIMULATIONS_PACKAGE_COMPONENTS}")

foreach(package_name IN LISTS SIMULATIONS_CMAKE_PACKAGES)
  set(package_source_dir "${SIMULATIONS_SOURCE_DIR}/src/${package_name}")
  set(package_build_dir "${SIMULATIONS_BUILD_DIR}/${package_name}")
  if(NOT EXISTS "${package_source_dir}/CMakeLists.txt")
    message(FATAL_ERROR "Package source directory not found: ${package_source_dir}")
  endif()

  message(STATUS "Packaging ${package_name}")

  execute_process(
    COMMAND "${CMAKE_COMMAND}" -G "${SIMULATIONS_CMAKE_GENERATOR}" -S "${package_source_dir}" -B "${package_build_dir}"
      -DROS_DISTRO=${ROS_DISTRO}
      -DCMAKE_INSTALL_PREFIX=/opt/ros/${ROS_DISTRO}
      -DCMAKE_PREFIX_PATH=/opt/ros/${ROS_DISTRO}
      -DBUILD_TESTING=OFF
      -DSIMULATIONS_PACKAGE_VERSION_SUFFIX=${SIMULATIONS_PACKAGE_VERSION_SUFFIX}
      -DPACKAGE_VERSION_SUFFIX=${SIMULATIONS_PACKAGE_VERSION_SUFFIX}
    COMMAND_ERROR_IS_FATAL ANY
  )
  execute_process(
    COMMAND "${CMAKE_COMMAND}" --build "${package_build_dir}" --parallel
    COMMAND_ERROR_IS_FATAL ANY
  )
  execute_process(
    COMMAND cpack --config "${package_build_dir}/CPackConfig.cmake" -G DEB -B "${SIMULATIONS_PACKAGE_OUTPUT_DIR}"
    COMMAND_ERROR_IS_FATAL ANY
  )
endforeach()
