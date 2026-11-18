# Copyright (C) 2026 Intel Corporation
#
# SPDX-License-Identifier: Apache-2.0

foreach(required_variable IN ITEMS ROS_DISTRO AI_DEMO_SOURCE_DIR AI_DEMO_BUILD_DIR AI_DEMO_GENERATOR AI_DEMO_PACKAGE_OUTPUT_DIR AI_DEMO_PACKAGE_COMPONENTS)
  if(NOT DEFINED ${required_variable} OR "${${required_variable}}" STREQUAL "")
    message(FATAL_ERROR "${required_variable} is required")
  endif()
endforeach()

file(MAKE_DIRECTORY "${AI_DEMO_PACKAGE_OUTPUT_DIR}")
string(REPLACE "," ";" package_components "${AI_DEMO_PACKAGE_COMPONENTS}")

foreach(component IN LISTS package_components)
  set(component_source_dir "${AI_DEMO_SOURCE_DIR}/src/${component}")
  set(component_build_dir "${AI_DEMO_BUILD_DIR}/${component}")
  if(NOT EXISTS "${component_source_dir}/CMakeLists.txt")
    message(FATAL_ERROR "Package source directory not found: ${component_source_dir}")
  endif()

  message(STATUS "Packaging ${component}")

  execute_process(
    COMMAND "${CMAKE_COMMAND}" -G "${AI_DEMO_GENERATOR}" -S "${component_source_dir}" -B "${component_build_dir}"
      -DROS_DISTRO=${ROS_DISTRO}
      "-DPACKAGE_VERSION_SUFFIX=${AI_DEMO_PACKAGE_VERSION_SUFFIX}"
    COMMAND_ERROR_IS_FATAL ANY
  )
  execute_process(
    COMMAND "${CMAKE_COMMAND}" --build "${component_build_dir}" --parallel
    COMMAND_ERROR_IS_FATAL ANY
  )
  execute_process(
    COMMAND "${CMAKE_CPACK_COMMAND}" --config "${component_build_dir}/CPackConfig.cmake" -G DEB -B "${AI_DEMO_PACKAGE_OUTPUT_DIR}"
    COMMAND_ERROR_IS_FATAL ANY
  )
endforeach()
