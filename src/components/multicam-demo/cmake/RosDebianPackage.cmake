# Copyright (C) 2026 Intel Corporation
#
# SPDX-License-Identifier: Apache-2.0

include_guard(GLOBAL)

# Packages the install tree as a single Debian package, versioned from
# <ROS_DISTRO>/debian/changelog and installed below /opt/ros/<ROS_DISTRO>.
# Keep BUILD_DEPENDS one quoted entry per line: GenerateDebianBuildDepends.cmake parses it.
function(configure_ros_debian_package_with_metadata)
  set(one_value_args PACKAGE_NAME DESCRIPTION CONTACT SECTION)
  set(multi_value_args BUILD_DEPENDS DEPENDS RECOMMENDS CONTROL_EXTRA)
  cmake_parse_arguments(ROS_DEBIAN "" "${one_value_args}" "${multi_value_args}" ${ARGN})

  if(NOT DEFINED ROS_DISTRO OR ROS_DISTRO STREQUAL "")
    message(FATAL_ERROR "ROS_DISTRO is required")
  endif()
  if(NOT ROS_DEBIAN_PACKAGE_NAME)
    message(FATAL_ERROR "PACKAGE_NAME is required")
  endif()

  set(changelog_file "${CMAKE_CURRENT_SOURCE_DIR}/${ROS_DISTRO}/debian/changelog")
  if(NOT EXISTS "${changelog_file}")
    message(FATAL_ERROR "Debian changelog not found: ${changelog_file}")
  endif()
  set_property(DIRECTORY APPEND PROPERTY CMAKE_CONFIGURE_DEPENDS "${changelog_file}")
  file(STRINGS "${changelog_file}" changelog_head LIMIT_COUNT 1)
  if(NOT changelog_head MATCHES "^[^(]+\\(([^)]+)\\)")
    message(FATAL_ERROR "Package version not found in ${changelog_file}")
  endif()
  set(package_version "${CMAKE_MATCH_1}${PACKAGE_VERSION_SUFFIX}")

  install(FILES "${changelog_file}"
    DESTINATION "share/doc/${ROS_DEBIAN_PACKAGE_NAME}"
    RENAME "changelog.Debian"
  )

  set(CPACK_GENERATOR "DEB")
  set(CPACK_PACKAGE_NAME "${ROS_DEBIAN_PACKAGE_NAME}")
  set(CPACK_PACKAGE_VERSION "${package_version}")
  set(CPACK_PACKAGE_CONTACT "${ROS_DEBIAN_CONTACT}")
  set(CPACK_PACKAGE_DESCRIPTION_SUMMARY "${ROS_DEBIAN_DESCRIPTION}")
  set(CPACK_PACKAGING_INSTALL_PREFIX "/opt/ros/${ROS_DISTRO}")
  set(CPACK_INSTALL_DEFAULT_DIRECTORY_PERMISSIONS
    OWNER_READ OWNER_WRITE OWNER_EXECUTE GROUP_READ GROUP_EXECUTE WORLD_READ WORLD_EXECUTE)
  set(CPACK_DEBIAN_FILE_NAME "DEB-DEFAULT")
  set(CPACK_DEBIAN_PACKAGE_SECTION "${ROS_DEBIAN_SECTION}")
  list(JOIN ROS_DEBIAN_DEPENDS ", " CPACK_DEBIAN_PACKAGE_DEPENDS)
  list(JOIN ROS_DEBIAN_RECOMMENDS ", " CPACK_DEBIAN_PACKAGE_RECOMMENDS)
  set(CPACK_DEBIAN_PACKAGE_CONTROL_EXTRA "${ROS_DEBIAN_CONTROL_EXTRA}")
  set(CPACK_DEBIAN_PACKAGE_CONTROL_STRICT_PERMISSION ON)

  include(CPack)
endfunction()
