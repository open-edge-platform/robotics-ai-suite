# Copyright (C) 2026 Intel Corporation
#
# SPDX-License-Identifier: Apache-2.0
#
# These contents may have been developed with support from one or more
# Intel-operated generative artificial intelligence solutions.

ROOT_DIR := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
COMPONENT_DIR := $(ROOT_DIR)/src/benchmark-framework

ROS_DISTRO ?= humble

# Map ROS_DISTRO to Ubuntu codename
ifeq ($(ROS_DISTRO),humble)
	UBUNTU_CODENAME := jammy
else ifeq ($(ROS_DISTRO),lyrical)
	UBUNTU_CODENAME := resolute
else
	UBUNTU_CODENAME := noble
endif

# Debian packaging (CMake + CPack)
PACKAGE_VERSION_SUFFIX ?=
PACKAGE_OUTPUT_DIR = $(ROOT_DIR)/build/debian-packages/packages
BUILD_DEPENDS_OUTPUT_DIR = $(ROOT_DIR)/build/debian-build-deps
MISSING_BUILD_DEPENDENCIES_FILE = $(BUILD_DEPENDS_OUTPUT_DIR)/missing-dependencies.txt

.DEFAULT_GOAL := help
.PHONY: help package debian-build-deps install-debian-build-deps

package:
	@# Help: Build Debian package on the host with CMake + CPack (produces ros-<distro>-benchmark-framework_*.deb)
	@command -v cmake >/dev/null || { echo "Error: CMake is required. Install cmake." >&2; exit 1; }
	@command -v cpack >/dev/null || { echo "Error: CPack is required. Install cmake." >&2; exit 1; }
	rm -rf $(ROOT_DIR)/build/debian-packages $(ROOT_DIR)/output
	cmake -S $(COMPONENT_DIR) -B $(ROOT_DIR)/build/debian-packages \
		-DROS_DISTRO=$(ROS_DISTRO) \
		-DBENCHMARK_PACKAGE_OUTPUT_DIR=$(PACKAGE_OUTPUT_DIR) \
		-DBENCHMARK_PACKAGE_VERSION_SUFFIX=$(PACKAGE_VERSION_SUFFIX)
	cmake --build $(ROOT_DIR)/build/debian-packages --target package
	mkdir -p $(ROOT_DIR)/output && cp $(PACKAGE_OUTPUT_DIR)/*.deb $(ROOT_DIR)/output/

debian-build-deps:
	@# Help: Generate Debian Build-Depends control file from CMakeLists.txt
	rm -rf $(BUILD_DEPENDS_OUTPUT_DIR)
	cmake -DROS_DISTRO=$(ROS_DISTRO) \
		-DBENCHMARK_SOURCE_DIR=$(COMPONENT_DIR) \
		-DBENCHMARK_BUILD_DEPENDS_OUTPUT_DIR=$(BUILD_DEPENDS_OUTPUT_DIR) \
		-P $(ROOT_DIR)/cmake/GenerateDebianBuildDepends.cmake

install-debian-build-deps: debian-build-deps
	@# Help: Install generated Debian Build-Depends with APT
	@command -v mk-build-deps >/dev/null && command -v equivs-build >/dev/null && command -v dpkg-checkbuilddeps >/dev/null || { echo "Error: mk-build-deps, equivs-build, and dpkg-checkbuilddeps are required. Install devscripts, equivs, and dpkg-dev." >&2; exit 1; }
	@apt-get update; \
	install_status=0; \
	for control_file in $(BUILD_DEPENDS_OUTPUT_DIR)/*/debian/control; do \
		mk-build-deps --install --remove \
			--tool 'apt-get --no-install-recommends --no-remove --yes' \
			"$$control_file" || install_status=1; \
	done; \
	: > $(MISSING_BUILD_DEPENDENCIES_FILE); \
	for control_file in $(BUILD_DEPENDS_OUTPUT_DIR)/*/debian/control; do \
		if missing_dependencies="$$(dpkg-checkbuilddeps "$$control_file" 2>&1)"; then \
			continue; \
		fi; \
		printf '%s\n%s\n\n' "$$control_file" "$$missing_dependencies" >> $(MISSING_BUILD_DEPENDENCIES_FILE); \
	done; \
	exit "$$install_status"

help:
	@# Help: Show this help message
	@printf "%-28s %s\n" "Target" "Description"
	@printf "%-28s %s\n" "------" "-----------"
	@grep -E '^[a-zA-Z0-9_%-]+:|^[[:space:]]+@# Help:' $(firstword $(MAKEFILE_LIST)) | \
	awk '\
		/^[a-zA-Z0-9_%-]+:/ { \
			target = $$1; \
			sub(":", "", target); \
		} \
		/^[[:space:]]+@# Help:/ { \
			if (target != "") { \
				help_line = $$0; \
				sub("^[[:space:]]+@# Help: ", "", help_line); \
				printf "%-28s %s\n", target, help_line; \
				target = ""; \
			} \
		}' | sort -k1,1
