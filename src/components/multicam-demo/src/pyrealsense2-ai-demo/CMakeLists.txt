# Copyright (C) 2026 Intel Corporation
#
# SPDX-License-Identifier: Apache-2.0

cmake_minimum_required(VERSION 3.20)
project(pyrealsense2-ai-demo NONE)

set(ROS_DISTRO "jazzy" CACHE STRING "ROS distribution whose debian/changelog is packaged")
set(PACKAGE_VERSION_SUFFIX "" CACHE STRING "Optional suffix appended to the Debian package version")

include(${CMAKE_CURRENT_SOURCE_DIR}/../../cmake/RosDebianPackage.cmake)

set(share_dir "share/${PROJECT_NAME}")
set(PACKAGE_SHARE_DIR "/opt/ros/${ROS_DISTRO}/${share_dir}")

install(DIRECTORY config/ DESTINATION "${share_dir}/config")
install(DIRECTORY scripts/ DESTINATION "${share_dir}/scripts"
  FILE_PERMISSIONS OWNER_READ OWNER_WRITE OWNER_EXECUTE GROUP_READ GROUP_EXECUTE WORLD_READ WORLD_EXECUTE
  FILES_MATCHING PATTERN "*.sh"
)
install(FILES
  src/mo.py
  src/pyrealsense2_ai_demo_launcher.py
  src/yolov8_model.pyx
  DESTINATION "${share_dir}/src"
)
install(PROGRAMS src/setup.py DESTINATION "${share_dir}/src")
install(DIRECTORY src/pyrealsense2_ai_demo DESTINATION "${share_dir}/src"
  PATTERN "__pycache__" EXCLUDE
  PATTERN "*.pyc" EXCLUDE
)
install(FILES pyproject.toml requirements.txt DESTINATION "${share_dir}")

set(maintainer_scripts "")
foreach(script IN ITEMS postinst prerm postrm)
  configure_file("debian/${script}.in" "${CMAKE_CURRENT_BINARY_DIR}/debian/${script}" @ONLY)
  list(APPEND maintainer_scripts "${CMAKE_CURRENT_BINARY_DIR}/debian/${script}")
endforeach()

set(package_depends
  "python3-dev"
  "ros-${ROS_DISTRO}-librealsense2 (>= 2.55.0)"
)
if(ROS_DISTRO STREQUAL "humble")
  list(APPEND package_depends "openvino (>= 2023.2.0)")
endif()
list(APPEND package_depends
  "intel-oneapi-runtime-compilers"
  "intel-oneapi-runtime-dpcpp-cpp"
  "intel-oneapi-runtime-mkl"
  "libze1 | level-zero"
  "intel-opencl-icd (>=23.43.27642.40)"
  "libze-intel-gpu1 (>=23.43.27642.40)"
)

configure_ros_debian_package_with_metadata(
  PACKAGE_NAME "ros-${ROS_DISTRO}-pyrealsense2-ai-demo"
  DESCRIPTION "Intel RealSense d4xx multi-camera streams Objects/Peoples detection demo of Intel OpenVINO optimized inferences in GPU using SSD-Mobilenet/Yolov8 models"
  CONTACT "ECI Maintainer <eci.maintainer@intel.com>"
  SECTION "utils"
  BUILD_DEPENDS
    "cmake"
    "python3"
    "python3-opencv"
    "python3-pytest"
    "python3-venv"
  DEPENDS
    ${package_depends}
  RECOMMENDS
    "ros-${ROS_DISTRO}-robotics-sdk-license"
  CONTROL_EXTRA
    ${maintainer_scripts}
)
