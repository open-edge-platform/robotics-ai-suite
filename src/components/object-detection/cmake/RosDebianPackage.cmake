# Copyright (C) 2026 Intel Corporation
#
# SPDX-License-Identifier: Apache-2.0

include_guard(GLOBAL)

# Resolve the package version suffix from the supported cache/CLI variables.
function(_objectdetection_resolve_version_suffix output_variable)
  if(DEFINED OBJECTDETECTION_PACKAGE_VERSION_SUFFIX)
    set(${output_variable} "${OBJECTDETECTION_PACKAGE_VERSION_SUFFIX}" PARENT_SCOPE)
  elseif(DEFINED PACKAGE_VERSION_SUFFIX)
    set(${output_variable} "${PACKAGE_VERSION_SUFFIX}" PARENT_SCOPE)
  else()
    set(${output_variable} "" PARENT_SCOPE)
  endif()
endfunction()

# Configure CPack for a ROS Debian package using metadata declared inline in the
# package CMakeLists.txt. The package version is read from the matching
# ${ROS_DISTRO}/debian/changelog so that versioning stays in a single place.
function(configure_ros_debian_package_with_metadata)
  set(options)
  set(one_value_args PACKAGE_NAME DESCRIPTION CONTACT)
  set(multi_value_args BUILD_DEPENDS DEPENDS RECOMMENDS)
  cmake_parse_arguments(ROS_DEBIAN "${options}" "${one_value_args}" "${multi_value_args}" ${ARGN})

  if(NOT DEFINED ROS_DISTRO OR ROS_DISTRO STREQUAL "")
    return()
  endif()
  if(ROS_DEBIAN_PACKAGE_NAME STREQUAL "")
    message(FATAL_ERROR "PACKAGE_NAME is required")
  endif()

  set(changelog_file "${CMAKE_CURRENT_SOURCE_DIR}/${ROS_DISTRO}/debian/changelog")
  if(NOT EXISTS "${changelog_file}")
    message(FATAL_ERROR "Debian changelog not found: ${changelog_file}")
  endif()
  file(READ "${changelog_file}" changelog_contents)
  string(REGEX MATCH "^[^(]+\\(([^)]+)\\)" changelog_match "${changelog_contents}")

  _objectdetection_resolve_version_suffix(package_version_suffix)
  set(package_version "${CMAKE_MATCH_1}${package_version_suffix}")

  if(package_version STREQUAL "")
    message(FATAL_ERROR "Package version not found in ${changelog_file}")
  endif()

  install(FILES "${changelog_file}"
    DESTINATION "share/doc/${ROS_DEBIAN_PACKAGE_NAME}"
    RENAME "changelog.Debian"
  )

  string(REPLACE ";" ", " package_dependencies "${ROS_DEBIAN_DEPENDS}")
  string(REPLACE ";" ", " package_recommends "${ROS_DEBIAN_RECOMMENDS}")

  set(CPACK_GENERATOR "DEB")
  set(CPACK_PACKAGE_NAME "${ROS_DEBIAN_PACKAGE_NAME}")
  set(CPACK_PACKAGE_VERSION "${package_version}")
  set(CPACK_PACKAGE_CONTACT "${ROS_DEBIAN_CONTACT}")
  set(CPACK_PACKAGE_DESCRIPTION_SUMMARY "${ROS_DEBIAN_DESCRIPTION}")
  set(CPACK_PACKAGING_INSTALL_PREFIX "/opt/ros/${ROS_DISTRO}")
  set(CPACK_DEBIAN_FILE_NAME "DEB-DEFAULT")
  set(CPACK_DEBIAN_PACKAGE_DEPENDS "${package_dependencies}")
  set(CPACK_DEBIAN_PACKAGE_RECOMMENDS "${package_recommends}")
  set(CPACK_DEBIAN_PACKAGE_SHLIBDEPS ON)

  include(CPack)
endfunction()
