# Copyright (C) 2025 Intel Corporation
#
# SPDX-License-Identifier: Apache-2.0

SHELL := bash -eu -o pipefail

COMMIT := $(shell git rev-parse --short HEAD)
DATE := $(shell git log -1 --format=%cd --date=format:"%Y%m%d")
VERSION := $(COMMIT)-$(DATE)

ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

ROS_DISTRO ?= humble
PACKAGE_VERSION_SUFFIX ?=
PROJECT_DEFINITION ?= $(ROOT_DIR)/robotics-project.json

# Map ROS_DISTRO to Ubuntu codename
ifeq ($(ROS_DISTRO),humble)
	UBUNTU_CODENAME := jammy
else ifeq ($(ROS_DISTRO),jazzy)
	UBUNTU_CODENAME := noble
else
	$(error Unsupported ROS_DISTRO: $(ROS_DISTRO). Supported: humble, jazzy)
endif

PACKAGE_COMPONENTS := $(shell PROJECT_DEFINITION="$(PROJECT_DEFINITION)" ROOT_DIR="$(ROOT_DIR)" python3 -c 'import json, os, pathlib, re; project = json.loads(pathlib.Path(os.environ["PROJECT_DEFINITION"]).read_text(encoding="utf-8")); components = project.get("ci", {}).get("package_components", []); root = pathlib.Path(os.environ["ROOT_DIR"]) / "src"; valid = project.get("format_version") == 1 and isinstance(components, list) and components and all(isinstance(component, dict) and isinstance(component.get("path"), str) and re.fullmatch(r"[a-z0-9][a-z0-9_-]*(/[a-z0-9][a-z0-9_-]*)*", component["path"]) and (root / component["path"]).is_dir() and ("ros_package" not in component or isinstance(component["ros_package"], str) and re.fullmatch(r"[a-z0-9][a-z0-9_]*", component["ros_package"])) for component in components); (_ for _ in ()).throw(SystemExit("Invalid package components in project definition")) if not valid else None; print(",".join(component["path"] for component in components))')
ROS_PACKAGES := $(shell PROJECT_DEFINITION="$(PROJECT_DEFINITION)" python3 -c 'import json, os, pathlib, re; project = json.loads(pathlib.Path(os.environ["PROJECT_DEFINITION"]).read_text(encoding="utf-8")); components = project.get("ci", {}).get("package_components", []); ros_components = [component for component in components if "ros_package" in component]; valid = project.get("format_version") == 1 and isinstance(components, list) and ros_components and all(isinstance(component, dict) and isinstance(component.get("ros_package"), str) and re.fullmatch(r"[a-z0-9][a-z0-9_]*", component["ros_package"]) for component in ros_components); (_ for _ in ()).throw(SystemExit("Invalid ROS packages in project definition")) if not valid else None; print(" ".join(component["ros_package"] for component in ros_components))')

PACKAGE_OUTPUT_DIR = $(ROOT_DIR)/build/debian-packages/packages
BUILD_DEPENDS_OUTPUT_DIR = $(ROOT_DIR)/build/debian-build-deps
MISSING_BUILD_DEPENDENCIES_FILE = $(BUILD_DEPENDS_OUTPUT_DIR)/missing-dependencies.txt
CONTAINER_IMAGE ?= amd64/ros:$(ROS_DISTRO)-ros-base
PACKAGE_CMAKE_GENERATOR := $(shell if command -v ninja >/dev/null 2>&1; then echo Ninja; else echo "Unix Makefiles"; fi)
CONTAINER_BUILD_TOOLING := cmake ninja-build build-essential devscripts equivs dpkg-dev quilt python3-colcon-common-extensions

.DEFAULT_GOAL := help
.PHONY: license-check build test package debian-build-deps install-debian-build-deps \
	build-nav2-msgs build-nav2-amcl install-patched-nav2 \
	container-debian-build-deps container-package container-test \
	clean help source-package lint lint-all lint-bash lint-clang lint-python lint-markdown lint-yaml

license-check:
	@# Help: Perform a REUSE license check using docker container https://hub.docker.com/r/fsfe/reuse
	docker run --rm --volume ${ROOT_DIR}:/data fsfe/reuse:5.0.2 lint

build-nav2-msgs:
	@# Help: Build patched ros-<distro>-nav2-msgs .deb from upstream source
	docker run --rm -t --platform linux/amd64 \
		-v $(ROOT_DIR):/src \
		$(CONTAINER_IMAGE) \
		bash -c "mkdir -p /tmp/build && cd /tmp/build/ && apt update && apt install -y quilt equivs devscripts && \
			apt source ros-${ROS_DISTRO}-nav2-msgs && \
			export QUILT_PATCHES=debian/patches && \
			export QUILT_REFRESH_ARGS=\"-p ab --no-timestamps --no-index\" && \
			cd ./ros-${ROS_DISTRO}-nav2-msgs-* && \
			quilt import -f -d n /src/3rd_party/patches/${ROS_DISTRO}/*-msgs-*.patch && \
			quilt push -a && \
			echo \"Building patched nav2_msgs packages\" && \
			mk-build-deps -i --host-arch amd64 --build-arch amd64 -t \"apt -y -q -o Debug::pkgProblemResolver=yes --no-install-recommends --allow-downgrades\" ./debian/control  && \
			echo \"1.0\" > ./debian/source/format && \
			sed -i 's/\(.*-nav2-msgs\) (\(.*\)) \(.*\)/\1 (\2-patch1) \3/g' ./debian/changelog && \
			dpkg-buildpackage && \
			find .. -name \"ros-${ROS_DISTRO}-nav2-msgs_*.deb\" -exec cp {} /src/ \;"

build-nav2-amcl: build-nav2-msgs
	@# Help: Build patched ros-<distro>-nav2-amcl .deb from upstream source
	docker run --rm -t --platform linux/amd64 \
		-v $(ROOT_DIR):/src \
		$(CONTAINER_IMAGE) \
		bash -c "mkdir -p /tmp/build && cd /tmp/build/ && apt update && apt install -y quilt equivs devscripts && \
			apt source ros-${ROS_DISTRO}-nav2-amcl && \
			find /src -name \"ros-${ROS_DISTRO}-nav2-msgs_*.deb\" -exec apt-get install -y -f {} \; && \
			export QUILT_PATCHES=debian/patches && \
			export QUILT_REFRESH_ARGS=\"-p ab --no-timestamps --no-index\" && \
			cd ./ros-${ROS_DISTRO}-nav2-amcl-* && \
			quilt import -f -d n /src/3rd_party/patches/${ROS_DISTRO}/*-amcl-*.patch && \
			quilt push -a && \
			echo \"Building patched amcl packages\" && \
			mk-build-deps -i --host-arch amd64 --build-arch amd64 -t \"apt -y -q -o Debug::pkgProblemResolver=yes --no-install-recommends --allow-downgrades\" ./debian/control  && \
			echo \"1.0\" > ./debian/source/format && \
			sed -i 's/\(.*-nav2-amcl\) (\(.*\)) \(.*\)/\1 (\2-patch1) \3/g' ./debian/changelog && \
			dpkg-buildpackage && \
			find .. -name \"ros-${ROS_DISTRO}-nav2-amcl_*.deb\" -exec cp {} /src/ \;"

install-patched-nav2:
	@# Help: Install locally built patched nav2 msgs/amcl .deb files (overlays stock nav2)
	@shopt -s nullglob; \
	patched_debs=($(ROOT_DIR)/ros-$(ROS_DISTRO)-nav2-msgs_*.deb $(ROOT_DIR)/ros-$(ROS_DISTRO)-nav2-amcl_*.deb); \
	if [ $${#patched_debs[@]} -eq 0 ]; then \
		echo "No patched nav2 .deb files found; run 'make build-nav2-amcl ROS_DISTRO=$(ROS_DISTRO)' first." >&2; \
		exit 1; \
	fi; \
	apt-get update; \
	apt-get install -y --allow-downgrades "$${patched_debs[@]}"

# -------------------------------------------------------------------
# Native targets (run inside a ROS environment / container)
# -------------------------------------------------------------------

build:
	@# Help: Build selected ROS packages with Colcon for local development
	@for pkg in $(ROS_PACKAGES); do rm -rf $(ROOT_DIR)/build/$$pkg; done
	set +u && source /opt/ros/$(ROS_DISTRO)/setup.bash && set -u && \
	colcon build --base-paths $(ROOT_DIR)/src --packages-select $(ROS_PACKAGES) --symlink-install --cmake-clean-cache \
		--executor sequential --event-handlers console_direct+ --cmake-args -DROS_DISTRO=$(ROS_DISTRO)

test:
	@# Help: Build & test selected ROS packages with Colcon
	set +u && source /opt/ros/$(ROS_DISTRO)/setup.bash && set -u && \
	colcon build --base-paths $(ROOT_DIR)/src --packages-select $(ROS_PACKAGES) --symlink-install --cmake-clean-cache \
		--cmake-args -DROS_DISTRO=$(ROS_DISTRO) -DBUILD_TESTING=ON --executor sequential --event-handlers console_direct+ && \
	set +u && source $(ROOT_DIR)/install/setup.bash && set -u && \
	colcon test --base-paths $(ROOT_DIR)/src --packages-select $(ROS_PACKAGES) --return-code-on-test-failure --executor sequential --event-handlers console_direct+ && \
	colcon test-result --verbose

package:
	@# Help: Build Debian packages natively using CPack
	rm -rf $(ROOT_DIR)/build/debian-packages
	set +u && source /opt/ros/$(ROS_DISTRO)/setup.bash && set -u && \
	cmake -G "$(PACKAGE_CMAKE_GENERATOR)" -S $(ROOT_DIR) -B $(ROOT_DIR)/build/debian-packages \
		-DROS_DISTRO=$(ROS_DISTRO) \
		-DITSPLANNER_PACKAGE_OUTPUT_DIR=$(PACKAGE_OUTPUT_DIR) \
		-DITSPLANNER_PACKAGE_COMPONENTS="$(PACKAGE_COMPONENTS)" \
		-DITSPLANNER_CMAKE_GENERATOR="$(PACKAGE_CMAKE_GENERATOR)" \
		-DITSPLANNER_PACKAGE_VERSION_SUFFIX=$(PACKAGE_VERSION_SUFFIX) && \
	cmake --build $(ROOT_DIR)/build/debian-packages --target package

debian-build-deps:
	@# Help: Generate Debian Build-Depends control files without configuring components
	rm -rf $(BUILD_DEPENDS_OUTPUT_DIR) $(ROOT_DIR)/build/debian-build-deps-config
	cmake -S $(ROOT_DIR) -B $(ROOT_DIR)/build/debian-build-deps-config \
		-DROS_DISTRO=$(ROS_DISTRO) \
		-DITSPLANNER_PACKAGE_COMPONENTS="$(PACKAGE_COMPONENTS)" \
		-DITSPLANNER_BUILD_DEPENDS_OUTPUT_DIR=$(BUILD_DEPENDS_OUTPUT_DIR) && \
	cmake --build $(ROOT_DIR)/build/debian-build-deps-config --target debian-build-deps

install-debian-build-deps: debian-build-deps
	@# Help: Install generated Debian Build-Depends with APT
	@command -v mk-build-deps >/dev/null && command -v equivs-build >/dev/null && command -v dpkg-checkbuilddeps >/dev/null || { echo "Error: mk-build-deps, equivs-build, and dpkg-checkbuilddeps are required. Install devscripts, equivs, and dpkg-dev." >&2; exit 1; }
	@apt-get update; \
	install_status=0; \
	while IFS= read -r -d '' control_file; do \
		mk-build-deps --install --remove \
			--tool 'apt-get --no-install-recommends --no-remove --yes' \
			"$$control_file" || install_status=1; \
	done < <(find $(BUILD_DEPENDS_OUTPUT_DIR) -path '*/debian/control' -print0); \
	: > $(MISSING_BUILD_DEPENDENCIES_FILE); \
	while IFS= read -r -d '' control_file; do \
		if missing_dependencies="$$(dpkg-checkbuilddeps "$$control_file" 2>&1)"; then \
			continue; \
		fi; \
		printf '%s\n%s\n\n' "$$control_file" "$$missing_dependencies" >> $(MISSING_BUILD_DEPENDENCIES_FILE); \
	done < <(find $(BUILD_DEPENDS_OUTPUT_DIR) -path '*/debian/control' -print0); \
	exit "$$install_status"

# -------------------------------------------------------------------
# Container wrappers (run native targets inside a ROS container)
# -------------------------------------------------------------------

container-debian-build-deps:
	@# Help: Generate Debian Build-Depends in container
	docker run --rm -t --platform linux/amd64 \
		-v $(ROOT_DIR):/workspace \
		-w /workspace \
		-e ROS_DISTRO=$(ROS_DISTRO) \
		-e DEBIAN_FRONTEND=noninteractive \
		$(CONTAINER_IMAGE) \
		bash -c "apt-get update -qq && apt-get install -y --no-install-recommends $(CONTAINER_BUILD_TOOLING) && \
			source /opt/ros/$(ROS_DISTRO)/setup.bash && \
			make debian-build-deps ROS_DISTRO=$(ROS_DISTRO)"

container-package: build-nav2-amcl
	@# Help: Build Debian packages inside ROS container on host
	docker run --rm -t --platform linux/amd64 \
		-v $(ROOT_DIR):/workspace \
		-w /workspace \
		-e ROS_DISTRO=$(ROS_DISTRO) \
		-e PACKAGE_VERSION_SUFFIX=$(PACKAGE_VERSION_SUFFIX) \
		-e DEBIAN_FRONTEND=noninteractive \
		$(CONTAINER_IMAGE) \
		bash -c "apt-get update -qq && apt-get install -y --no-install-recommends $(CONTAINER_BUILD_TOOLING) && \
			source /opt/ros/$(ROS_DISTRO)/setup.bash && \
			make install-debian-build-deps ROS_DISTRO=$(ROS_DISTRO) && \
			make install-patched-nav2 ROS_DISTRO=$(ROS_DISTRO) && \
			make package ROS_DISTRO=$(ROS_DISTRO) PACKAGE_VERSION_SUFFIX=$(PACKAGE_VERSION_SUFFIX)"

container-test: build-nav2-amcl
	@# Help: Build & test with Colcon inside ROS container on host
	docker run --rm -t --platform linux/amd64 \
		-v $(ROOT_DIR):/workspace \
		-w /workspace \
		-e ROS_DISTRO=$(ROS_DISTRO) \
		-e DEBIAN_FRONTEND=noninteractive \
		$(CONTAINER_IMAGE) \
		bash -c "apt-get update -qq && apt-get install -y --no-install-recommends $(CONTAINER_BUILD_TOOLING) && \
			source /opt/ros/$(ROS_DISTRO)/setup.bash && \
			make install-debian-build-deps ROS_DISTRO=$(ROS_DISTRO) && \
			make install-patched-nav2 ROS_DISTRO=$(ROS_DISTRO) && \
			make test ROS_DISTRO=$(ROS_DISTRO)"

clean:
	@# Help: Remove local build, install, log, and package artifacts
	rm -rf $(ROOT_DIR)/build $(ROOT_DIR)/install $(ROOT_DIR)/log $(ROOT_DIR)/output *.deb *.buildinfo *.changes 2>/dev/null || \
	docker run --rm -v $(ROOT_DIR):/workspace $(CONTAINER_IMAGE) rm -rf /workspace/build /workspace/install /workspace/log /workspace/output


source-package:
	@# Help: Create source package tarball
	git archive --format=zip -o its-planner-$(VERSION).zip HEAD \
		.gitattributes .gitignore .gitmodules Makefile README.md REUSE.toml CMakeLists.txt \
		.github/linters 3rd_party cmake docs LICENSES src robotics-project.json

lint:
	@# Help: Run all sub-linters using super-linter (using linters defined for this repo only)
	VALIDATE_GITHUB_ACTIONS=true \
	VALIDATE_YAML=true \
	VALIDATE_JSON=true \
	VALIDATE_PYTHON_PYLINT=true \
	VALIDATE_PYTHON_FLAKE8=true \
	VALIDATE_BASH=true \
	VALIDATE_MARKDOWN=true \
	VALIDATE_CLANG_FORMAT=true \
	VALIDATE_ALL_CODEBASE=true \
		make lint-all

lint-bash:
	@# Help: Run bash lint only
	VALIDATE_BASH=true \
	VALIDATE_ALL_CODEBASE=true \
		make lint-all

lint-clang:
	@# Help: Run clang-format lint only
	VALIDATE_CLANG_FORMAT=true \
	VALIDATE_ALL_CODEBASE=true \
		make lint-all

lint-python:
	@# Help: Run Python lint (pylint and flake8) only
	VALIDATE_PYTHON_PYLINT=true \
	VALIDATE_PYTHON_FLAKE8=true \
	VALIDATE_ALL_CODEBASE=true \
		make lint-all

lint-markdown:
	@# Help: Run Markdown lint only
	VALIDATE_MARKDOWN=true \
	VALIDATE_ALL_CODEBASE=true \
		make lint-all

lint-yaml:
	@# Help: Run YAML lint only
	VALIDATE_YAML=true \
	VALIDATE_ALL_CODEBASE=true \
		make lint-all

lint-all:
	@# Help: Run super-linter over entire repository (auto-detects code to lint)
	docker run --rm --platform linux/amd64 \
		-e SHELL=/bin/bash \
		-e RUN_LOCAL=true \
		--env-file ".github/linters/super-linter.env" \
		$(if $(VALIDATE_GITHUB_ACTIONS),-e VALIDATE_GITHUB_ACTIONS=$(VALIDATE_GITHUB_ACTIONS)) \
		$(if $(VALIDATE_YAML),-e VALIDATE_YAML=$(VALIDATE_YAML)) \
		$(if $(VALIDATE_JSON),-e VALIDATE_JSON=$(VALIDATE_JSON)) \
		$(if $(VALIDATE_PYTHON_PYLINT),-e VALIDATE_PYTHON_PYLINT=$(VALIDATE_PYTHON_PYLINT)) \
		$(if $(VALIDATE_PYTHON_FLAKE8),-e VALIDATE_PYTHON_FLAKE8=$(VALIDATE_PYTHON_FLAKE8)) \
		$(if $(VALIDATE_BASH),-e VALIDATE_BASH=$(VALIDATE_BASH)) \
		$(if $(VALIDATE_MARKDOWN),-e VALIDATE_MARKDOWN=$(VALIDATE_MARKDOWN)) \
		$(if $(VALIDATE_CLANG_FORMAT),-e VALIDATE_CLANG_FORMAT=$(VALIDATE_CLANG_FORMAT)) \
		$(if $(VALIDATE_ALL_CODEBASE),-e VALIDATE_ALL_CODEBASE=$(VALIDATE_ALL_CODEBASE)) \
		-v $(ROOT_DIR):/tmp/lint \
			ghcr.io/super-linter/super-linter:slim-v8.1.0

help:
	@printf "%-28s %s\n" "Target" "Description"
	@printf "%-28s %s\n" "------" "-----------"
	@grep -E '^[a-zA-Z0-9_%-]+:|^[[:space:]]+@# Help:' Makefile | \
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
