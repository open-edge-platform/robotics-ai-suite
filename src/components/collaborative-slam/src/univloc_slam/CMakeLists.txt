# Copyright (C) 2025 Intel Corporation
#
# SPDX-License-Identifier: Apache-2.0

cmake_minimum_required(VERSION 3.8)
project(
  univloc_slam
  LANGUAGES CXX
  VERSION ${UNIVLOC_VERSION_STRING})

include(${CMAKE_CURRENT_SOURCE_DIR}/../../cmake/univloc_setup.cmake)

# Detect ROS distribution
if(NOT DEFINED ENV{ROS_DISTRO})
  message(FATAL_ERROR "ROS_DISTRO environment variable not set")
endif()

set(ROS_DISTRO $ENV{ROS_DISTRO})
message(STATUS "Building for ROS ${ROS_DISTRO}")

# Validate supported ROS distributions
if(NOT ROS_DISTRO STREQUAL "humble" AND NOT ROS_DISTRO STREQUAL "jazzy")
  message(WARNING "Unsupported ROS distribution: ${ROS_DISTRO}. Supported: humble, jazzy")
endif()

find_package(ament_cmake REQUIRED)
find_package(ament_lint_auto REQUIRED)
find_package(ament_cmake_python REQUIRED)
find_package(rclcpp REQUIRED)
find_package(cv_bridge REQUIRED)
find_package(sensor_msgs REQUIRED)
find_package(geometry_msgs REQUIRED)
find_package(visualization_msgs REQUIRED)
find_package(univloc_msgs REQUIRED)

# ROS Jazzy specific packages
if(ROS_DISTRO STREQUAL "jazzy")
  find_package(ament_index_cpp REQUIRED)
endif()

if(NOT USE_PREBUILT_DEPS)
  ament_export_dependencies(univloc_dependencies)
endif()

# ----- Build the library -----
add_library(
  univloc_slam
  ${CMAKE_CURRENT_SOURCE_DIR}/type.h
  ${CMAKE_CURRENT_SOURCE_DIR}/config.cc
  ${CMAKE_CURRENT_SOURCE_DIR}/tracking_module.h
  ${CMAKE_CURRENT_SOURCE_DIR}/mapping_module.h
  ${CMAKE_CURRENT_SOURCE_DIR}/tracking_module.cc
  ${CMAKE_CURRENT_SOURCE_DIR}/mapping_module.cc
  ${CMAKE_CURRENT_SOURCE_DIR}/global_optimization_module.cc
  ${CMAKE_CURRENT_SOURCE_DIR}/fast_mapping/fast_mapping_helper.cpp)

target_include_directories(
  univloc_slam
  PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}>
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/fast_mapping>
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/../../include>
    $<INSTALL_INTERFACE:include>
    $<INSTALL_INTERFACE:include/openvslam>
    $<INSTALL_INTERFACE:include/openvslam/fast_mapping>
    ${EIGEN3_INCLUDE_DIR}
  PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CMAKE_CURRENT_SOURCE_DIR}/fast_mapping
    ${CMAKE_CURRENT_SOURCE_DIR}/../../include)

if(NOT USE_GPU_LEVEL_ZERO)
  if(USE_SSE_ORB)
    target_compile_definitions(${PROJECT_NAME} PRIVATE USE_SSE_ORB)
  endif()

  target_include_directories(
    ${PROJECT_NAME} PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/feature/default)
  target_link_libraries(
    univloc_slam
    ${OpenCV_LIBRARIES}
    Threads::Threads
    yaml-cpp
    ${LAPACK_LIBRARIES}
    ${LIBVA}
    ${LIBVA_DRM})
else()
  # Level Zero based Orb Extractor gpu
  message(STATUS "Level Zero GPU acceleration enabled")
  if(USE_PREBUILT_DEPS)
    # Initialize ORB library variable
    set(ORB_LIBRARIES "")
    
    find_package(orblze REQUIRED)
    set(ORB_LIBRARIES ${orblze_LIBS})
    target_compile_definitions(${PROJECT_NAME} PRIVATE)
    
    if(NOT CM_GPU_INSTALL_DIR)
      message(STATUS "Level Zero ORB extractor library found at ${ORBLZE_KERNEL_DIR}")
      target_compile_definitions(
        ${PROJECT_NAME} PRIVATE GPU_KERNEL_PATH="${ORBLZE_KERNEL_DIR}/")
    else()
      message(STATUS "Level Zero ORB extractor library found at ${CM_GPU_INSTALL_DIR}")
      target_compile_definitions(
        ${PROJECT_NAME} PRIVATE GPU_KERNEL_PATH="${CM_GPU_INSTALL_DIR}/")
    endif()

    # Link libraries (same for both distributions)
    target_link_libraries(
      univloc_slam
      ${OpenCV_LIBRARIES}
      Threads::Threads
      yaml-cpp
      ${ORB_LIBRARIES}
      ${LAPACK_LIBRARIES}
      ${LIBVA}
      ${LIBVA_DRM})
  else()
    target_include_directories(${PROJECT_NAME}
                               PRIVATE ${CM_GPU_INSTALL_DIR}/include)
    target_link_libraries(
      univloc_slam
      ${OpenCV_LIBRARIES}
      Threads::Threads
      yaml-cpp
      ${LAPACK_LIBRARIES}
      ${LIBVA}
      ${LIBVA_DRM}
      ${CM_LIBRARIES})
  endif()
endif()

if(NOT USE_PREBUILT_DEPS)
  # Set dependencies based on ROS distribution
  if(ROS_DISTRO STREQUAL "jazzy")
    set(dependencies rclcpp cv_bridge ament_index_cpp univloc_dependencies)
  else()
    # ROS Humble
    set(dependencies rclcpp cv_bridge univloc_dependencies)
  endif()
else()
  target_compile_definitions(${PROJECT_NAME} PUBLIC USE_DBOW2)
  target_compile_definitions(${PROJECT_NAME} PUBLIC G2O_USE_VENDORED_CERES)

  # Set dependencies based on ROS distribution
  if(ROS_DISTRO STREQUAL "jazzy")
    set(dependencies rclcpp cv_bridge ament_index_cpp DBoW2 univloc_msgs sensor_msgs geometry_msgs visualization_msgs)
    # Use standard g2o for Jazzy
    find_package(g2o REQUIRED)
    target_link_libraries(${PROJECT_NAME} 
                          g2o::core
                          g2o::types_slam3d 
                          g2o::solver_csparse)
  else()
    # ROS Humble
    set(dependencies rclcpp cv_bridge DBoW2 univloc_msgs sensor_msgs geometry_msgs visualization_msgs)
    find_package(g2o REQUIRED)
    target_link_libraries(${PROJECT_NAME} 
                          g2o::core
                          g2o::types_slam3d
                          g2o::types_sba
                          g2o::solver_csparse)
  endif()
endif()

ament_target_dependencies(univloc_slam ${dependencies})

# ----- Append subdirectory -----
set(OPENVSLAM_INCLUDE_INSTALL_DIR include/openvslam)
add_subdirectory(camera)
add_subdirectory(data)
add_subdirectory(feature)
add_subdirectory(initialize)
add_subdirectory(io)
add_subdirectory(match)
add_subdirectory(module)
add_subdirectory(optimize)
add_subdirectory(solve)
add_subdirectory(util)

# Install headers
file(GLOB HEADERS "${CMAKE_CURRENT_SOURCE_DIR}/*.h")
install(FILES ${HEADERS} DESTINATION ${OPENVSLAM_INCLUDE_INSTALL_DIR})
install(DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/../../include/
  DESTINATION include
)
install(DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/fast_mapping/
  DESTINATION ${OPENVSLAM_INCLUDE_INSTALL_DIR}/fast_mapping
  FILES_MATCHING PATTERN "*.h" PATTERN "*.hpp"
)

install(
  TARGETS ${PROJECT_NAME}
  EXPORT ${PROJECT_NAME}
  LIBRARY DESTINATION lib
  ARCHIVE DESTINATION lib
  RUNTIME DESTINATION bin
  INCLUDES
  DESTINATION ${OPENVSLAM_INCLUDE_INSTALL_DIR})

ament_export_include_directories(include ${OPENVSLAM_INCLUDE_INSTALL_DIR} ${OPENVSLAM_INCLUDE_INSTALL_DIR}/fast_mapping)
ament_export_dependencies(Threads rclcpp cv_bridge DBoW2 univloc_msgs sensor_msgs geometry_msgs visualization_msgs)
if(ROS_DISTRO STREQUAL "jazzy")
  ament_export_dependencies(g2o ament_index_cpp)
else()
  ament_export_dependencies(g2o)
endif()
ament_export_targets(${PROJECT_NAME} HAS_LIBRARY_TARGET)
ament_package()

include(${CMAKE_CURRENT_SOURCE_DIR}/../../cmake/RosDebianPackage.cmake)
configure_ros_debian_package_with_metadata(
  PACKAGE_NAME "ros-${ROS_DISTRO}-univloc-slam"
  DESCRIPTION "Core SLAM library for Intel Collaborative SLAM"
  CONTACT "ECI Maintainer <eci-maintainer@intel.com>"
  PROVIDES "ros-${ROS_DISTRO}-univloc-slam-sse, ros-${ROS_DISTRO}-univloc-slam-avx2, ros-${ROS_DISTRO}-univloc-slam-lze, ros-${ROS_DISTRO}-univloc-slam-dev"
  CONFLICTS "ros-${ROS_DISTRO}-univloc-slam-sse, ros-${ROS_DISTRO}-univloc-slam-avx2, ros-${ROS_DISTRO}-univloc-slam-lze, ros-${ROS_DISTRO}-univloc-slam-dev"
  REPLACES "ros-${ROS_DISTRO}-univloc-slam-sse, ros-${ROS_DISTRO}-univloc-slam-avx2, ros-${ROS_DISTRO}-univloc-slam-lze, ros-${ROS_DISTRO}-univloc-slam-dev"
  BUILD_DEPENDS
    "build-essential"
    "ninja-build"
    "ros-${ROS_DISTRO}-ament-cmake"
    "ros-${ROS_DISTRO}-ament-lint-common"
    "ros-${ROS_DISTRO}-ament-lint-auto"
    "ros-${ROS_DISTRO}-ament-cmake-gtest"
    "ros-${ROS_DISTRO}-ament-cmake-python"
    "ros-${ROS_DISTRO}-rclcpp"
    "ros-${ROS_DISTRO}-cv-bridge"
    "ros-${ROS_DISTRO}-dbow2"
    "ros-${ROS_DISTRO}-libg2o"
    "ros-${ROS_DISTRO}-univloc-msgs"
    "libspdlog-dev"
    "nlohmann-json3-dev"
    "libopencv-dev"
    "libeigen3-dev"
    "liblapack-dev"
    "libsuitesparse-dev"
    "libva-dev"
    "libyaml-cpp-dev"
    "libboost-dev"
  DEPENDS
    "ros-${ROS_DISTRO}-rclcpp"
    "ros-${ROS_DISTRO}-cv-bridge"
    "ros-${ROS_DISTRO}-dbow2"
    "ros-${ROS_DISTRO}-libg2o"
    "ros-${ROS_DISTRO}-univloc-msgs"
)
