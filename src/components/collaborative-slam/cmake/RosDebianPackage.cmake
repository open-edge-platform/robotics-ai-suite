# Copyright (C) 2026 Intel Corporation
#
# SPDX-License-Identifier: Apache-2.0

include_guard(GLOBAL)

function(configure_ros_debian_package_with_metadata)
  set(options)
  set(one_value_args PACKAGE_NAME DESCRIPTION CONTACT PROVIDES CONFLICTS REPLACES)
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
  set(version_suffix "${COLLAB_SLAM_PACKAGE_VERSION_SUFFIX}")
  if(version_suffix STREQUAL "" AND DEFINED PACKAGE_VERSION_SUFFIX)
    set(version_suffix "${PACKAGE_VERSION_SUFFIX}")
  endif()
  set(package_version "${CMAKE_MATCH_1}${version_suffix}")
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
  if(NOT ROS_DEBIAN_CONTACT STREQUAL "")
    set(CPACK_PACKAGE_CONTACT "${ROS_DEBIAN_CONTACT}")
  else()
    set(CPACK_PACKAGE_CONTACT "ECI Maintainer <eci-maintainer@intel.com>")
  endif()
  set(CPACK_PACKAGE_DESCRIPTION_SUMMARY "${ROS_DEBIAN_DESCRIPTION}")
  set(CPACK_PACKAGING_INSTALL_PREFIX "/opt/ros/${ROS_DISTRO}")
  set(CPACK_DEBIAN_FILE_NAME "DEB-DEFAULT")
  set(CPACK_DEBIAN_PACKAGE_DEPENDS "${package_dependencies}")
  set(CPACK_DEBIAN_PACKAGE_RECOMMENDS "${package_recommends}")
  if(NOT "${ROS_DEBIAN_PROVIDES}" STREQUAL "")
    set(CPACK_DEBIAN_PACKAGE_PROVIDES "${ROS_DEBIAN_PROVIDES}")
  endif()
  if(NOT "${ROS_DEBIAN_CONFLICTS}" STREQUAL "")
    set(CPACK_DEBIAN_PACKAGE_CONFLICTS "${ROS_DEBIAN_CONFLICTS}")
  endif()
  if(NOT "${ROS_DEBIAN_REPLACES}" STREQUAL "")
    set(CPACK_DEBIAN_PACKAGE_REPLACES "${ROS_DEBIAN_REPLACES}")
  endif()
  set(CPACK_DEBIAN_PACKAGE_SHLIBDEPS ON)

  include(CPack)
endfunction()
