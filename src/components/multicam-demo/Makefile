# SPDX-FileCopyrightText: (C) 2025 Intel Corporation
#
# SPDX-License-Identifier: Apache-2.0

#----------------------------------------------------------------------------------------------------------------------
# Flags
#----------------------------------------------------------------------------------------------------------------------
SHELL := bash -eu -o pipefail
ROOT_DIR := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
ROS_DISTRO ?= humble

# Version info for packaging
COMMIT := $(shell git rev-parse --short HEAD)
DATE := $(shell git log -1 --format=%cd --date=format:"%Y%m%d")
VERSION := $(COMMIT)-$(DATE)

# Absolute path to the git repository root (needed so super-linter sees .git even when invoked from this component)
REPO_ROOT:=$(shell git rev-parse --show-toplevel 2>/dev/null || echo $(ROOT_DIR))

# Path of this component relative to repo root (used to scope linting with FILTER_REGEX_INCLUDE)
COMPONENT_PATH_REL:=$(shell realpath --relative-to "$(REPO_ROOT)" "$(ROOT_DIR)" 2>/dev/null || echo robotics-ai-suite/components/multicam-demo)

#----------------------------------------------------------------------------------------------------------------------
# Packaging Settings
#----------------------------------------------------------------------------------------------------------------------
PROJECT_DEFINITION ?= $(ROOT_DIR)/robotics-project.json
PACKAGE_VERSION_SUFFIX ?=
PACKAGE_COMPONENTS := $(shell PROJECT_DEFINITION="$(PROJECT_DEFINITION)" ROOT_DIR="$(ROOT_DIR)" python3 -c 'import json, os, pathlib, re, sys; project = json.loads(pathlib.Path(os.environ["PROJECT_DEFINITION"]).read_text(encoding="utf-8")); components = project.get("ci", {}).get("package_components", []); root = pathlib.Path(os.environ["ROOT_DIR"]) / "src"; valid = project.get("format_version") == 1 and isinstance(components, list) and components and all(isinstance(component, dict) and isinstance(component.get("path"), str) and re.fullmatch(r"[a-z0-9][a-z0-9_-]*", component["path"]) and (root / component["path"]).is_dir() for component in components); valid or sys.exit("Invalid package components in project definition"); print(",".join(component["path"] for component in components))')
ifeq ($(PACKAGE_COMPONENTS),)
$(error No package components resolved from $(PROJECT_DEFINITION))
endif
comma := ,
COMPONENT_LIST := $(subst $(comma), ,$(PACKAGE_COMPONENTS))

BUILD_DIR = $(ROOT_DIR)/build
PACKAGE_OUTPUT_DIR ?= $(BUILD_DIR)/debian-packages/packages
BUILD_DEPENDS_OUTPUT_DIR = $(BUILD_DIR)/debian-build-deps
MISSING_BUILD_DEPENDENCIES_FILE = $(BUILD_DEPENDS_OUTPUT_DIR)/missing-dependencies.txt
CONTAINER_IMAGE ?= amd64/ros:$(ROS_DISTRO)-ros-base

# Package source and its install location (used by test-e2e)
AI_DEMO_DIR = $(ROOT_DIR)/src/pyrealsense2-ai-demo
AI_DEMO_INSTALL_DIR = /opt/ros/$(ROS_DISTRO)/share/pyrealsense2-ai-demo

# pyrealsense2 is only available from PyPI, so tests run in a venv layered on the system packages
TEST_VENV = $(BUILD_DIR)/test-venv
TEST_RESULTS_DIR = $(BUILD_DIR)/test-results

#----------------------------------------------------------------------------------------------------------------------
# Docker Settings
#----------------------------------------------------------------------------------------------------------------------
DOCKER_IMAGE_NAME=realsense-d457-ai-demo

DOCKER_RUN_PARAMS= \
	-it --rm -a stdout -a stderr -e DISPLAY=${DISPLAY} -e NO_AT_BRIDGE=1  \
	--privileged -v /dev:/dev \
	-e DPNP_RAISE_EXCEPION_ON_NUMPY_FALLBACK=0 \
	--cap-add=SYS_ADMIN --cap-add=SYS_PTRACE \
	-v ${AI_DEMO_DIR}/src:/workspace/src \
	-v ${AI_DEMO_DIR}/scripts:/workspace/scripts \
	-v ${AI_DEMO_DIR}/config:/workspace/config \
	-v ${ROOT_DIR}/models:/workspace/models \
	-v ${ROOT_DIR}/videos:/workspace/videos \
	-v /tmp/.X11-unix:/tmp/.X11-unix  -v ${HOME}/.Xauthority:/home/root/.Xauthority \
	${DOCKER_IMAGE_NAME}

#----------------------------------------------------------------------------------------------------------------------
# Targets
#----------------------------------------------------------------------------------------------------------------------
default: demo
.PHONY: default build test test-e2e package debian-build-deps install-debian-build-deps \
	container-debian-build-deps container-package container-test \
	license-check lint lint-all lint-python lint-yaml lint-githubactions lint-bash lint-json lint-markdown \
	image source-package models yolov8_models mobilenet_models demo bash clean help

build:
	@# Help: Configure and build the package components natively
	for component in $(COMPONENT_LIST); do \
		cmake -S $(ROOT_DIR)/src/$$component -B $(BUILD_DIR)/$$component -DROS_DISTRO=$(ROS_DISTRO); \
		cmake --build $(BUILD_DIR)/$$component --parallel; \
	done

$(TEST_VENV)/.ready:
	rm -rf $(TEST_VENV)
	python3 -m venv --system-site-packages $(TEST_VENV)
	$(TEST_VENV)/bin/python -m pip install --quiet pyrealsense2
	touch $@

test: $(TEST_VENV)/.ready
	@# Help: Run unit tests natively against the package sources
	mkdir -p $(TEST_RESULTS_DIR)
	cd $(ROOT_DIR)/tests/unittest && \
	PYREALSENSE2_AI_DEMO_SRC=$(AI_DEMO_DIR)/src/pyrealsense2_ai_demo \
		$(TEST_VENV)/bin/python -m pytest -v --junitxml=$(TEST_RESULTS_DIR)/unittest.xml realsense-d457-ai-demo_pytest.py

test-e2e: $(TEST_VENV)/.ready
	@# Help: Run unit tests natively against the installed Debian package
	@test -d $(AI_DEMO_INSTALL_DIR)/src/pyrealsense2_ai_demo || { echo "Error: ros-$(ROS_DISTRO)-pyrealsense2-ai-demo is not installed in $(AI_DEMO_INSTALL_DIR)." >&2; exit 1; }
	mkdir -p $(TEST_RESULTS_DIR)
	cd $(ROOT_DIR)/tests/unittest && \
	PYREALSENSE2_AI_DEMO_SRC=$(AI_DEMO_INSTALL_DIR)/src/pyrealsense2_ai_demo \
		$(TEST_VENV)/bin/python -m pytest -v --junitxml=$(TEST_RESULTS_DIR)/e2e.xml realsense-d457-ai-demo_pytest.py

package:
	@# Help: Build Debian packages natively with CPack
	rm -rf $(BUILD_DIR)/debian-packages
	cmake -S $(ROOT_DIR) -B $(BUILD_DIR)/debian-packages \
		-DROS_DISTRO=$(ROS_DISTRO) \
		-DAI_DEMO_PACKAGE_OUTPUT_DIR=$(PACKAGE_OUTPUT_DIR) \
		-DAI_DEMO_PACKAGE_COMPONENTS="$(PACKAGE_COMPONENTS)" \
		"-DAI_DEMO_PACKAGE_VERSION_SUFFIX=$(PACKAGE_VERSION_SUFFIX)"
	cmake --build $(BUILD_DIR)/debian-packages --target package

debian-build-deps:
	@# Help: Generate Debian Build-Depends control files without configuring components
	rm -rf $(BUILD_DEPENDS_OUTPUT_DIR) $(BUILD_DIR)/debian-build-deps-config
	cmake -S $(ROOT_DIR) -B $(BUILD_DIR)/debian-build-deps-config \
		-DROS_DISTRO=$(ROS_DISTRO) \
		-DAI_DEMO_PACKAGE_COMPONENTS="$(PACKAGE_COMPONENTS)" \
		-DAI_DEMO_BUILD_DEPENDS_OUTPUT_DIR=$(BUILD_DEPENDS_OUTPUT_DIR)
	cmake --build $(BUILD_DIR)/debian-build-deps-config --target debian-build-deps

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

container-debian-build-deps:
	@# Help: Generate Debian Build-Depends in container
	docker run --rm -t --platform linux/amd64 \
		-v $(ROOT_DIR):/workspace \
		-w /workspace \
		-e ROS_DISTRO=$(ROS_DISTRO) \
		-e DEBIAN_FRONTEND=noninteractive \
		$(CONTAINER_IMAGE) \
		bash -c "apt-get update -qq && apt-get install -y --no-install-recommends make python3 cmake && \
			make debian-build-deps ROS_DISTRO=$(ROS_DISTRO)"

container-package:
	@# Help: Build Debian packages inside ROS container on host
	docker run --rm -t --platform linux/amd64 \
		-v $(ROOT_DIR):/workspace \
		-w /workspace \
		-e ROS_DISTRO=$(ROS_DISTRO) \
		-e PACKAGE_VERSION_SUFFIX=$(PACKAGE_VERSION_SUFFIX) \
		-e DEBIAN_FRONTEND=noninteractive \
		$(CONTAINER_IMAGE) \
		bash -c "apt-get update -qq && apt-get install -y --no-install-recommends make python3 cmake devscripts equivs dpkg-dev && \
			make install-debian-build-deps ROS_DISTRO=$(ROS_DISTRO) && \
			make package ROS_DISTRO=$(ROS_DISTRO) PACKAGE_VERSION_SUFFIX=$(PACKAGE_VERSION_SUFFIX)"

container-test:
	@# Help: Run unit tests inside ROS container on host
	docker run --rm -t --platform linux/amd64 \
		-v $(ROOT_DIR):/workspace \
		-w /workspace \
		-e ROS_DISTRO=$(ROS_DISTRO) \
		-e DEBIAN_FRONTEND=noninteractive \
		$(CONTAINER_IMAGE) \
		bash -c "apt-get update -qq && apt-get install -y --no-install-recommends make python3 cmake devscripts equivs dpkg-dev && \
			make install-debian-build-deps ROS_DISTRO=$(ROS_DISTRO) && \
			make test ROS_DISTRO=$(ROS_DISTRO)"

license-check:
	@# Help: Perform a REUSE license check using docker container https://hub.docker.com/r/fsfe/reuse
	@docker run --rm --volume ${ROOT_DIR}:/data fsfe/reuse:5.0.2 lint

lint:
	@$(call msg, Running all linters using super-linter ...)
	VALIDATE_GITHUB_ACTIONS=true \
	VALIDATE_YAML=true \
	VALIDATE_JSON=true \
	VALIDATE_PYTHON=true \
	VALIDATE_BASH=true \
	VALIDATE_MARKDOWN=true \
		$(MAKE) lint-all

lint-all:
	@$(call msg, Running super-linter ...)
	@docker run --rm --platform linux/amd64 \
		-e SHELL=/bin/bash \
		-e RUN_LOCAL=true \
		-e DEFAULT_BRANCH=main \
		-e VALIDATE_ALL_CODEBASE=false \
		-e FILTER_REGEX_INCLUDE="^$(COMPONENT_PATH_REL)/" \
		-e LINTER_RULES_PATH=$(COMPONENT_PATH_REL)/.github/linters \
		$(if $(VALIDATE_GITHUB_ACTIONS),-e VALIDATE_GITHUB_ACTIONS=$(VALIDATE_GITHUB_ACTIONS)) \
		$(if $(GITHUB_ACTIONS_COMMAND_ARGS),-e GITHUB_ACTIONS_COMMAND_ARGS=$(GITHUB_ACTIONS_COMMAND_ARGS)) \
		$(if $(VALIDATE_YAML),-e VALIDATE_YAML=$(VALIDATE_YAML)) \
		$(if $(VALIDATE_JSON),-e VALIDATE_JSON=$(VALIDATE_JSON)) \
		$(if $(VALIDATE_PYTHON),-e VALIDATE_PYTHON=$(VALIDATE_PYTHON)) \
		$(if $(VALIDATE_BASH),-e VALIDATE_BASH=$(VALIDATE_BASH)) \
		$(if $(VALIDATE_MARKDOWN),-e VALIDATE_MARKDOWN=$(VALIDATE_MARKDOWN)) \
		-v $(REPO_ROOT):/tmp/lint \
			ghcr.io/super-linter/super-linter:slim-v7.3.0

lint-python:
	@$(call msg, Running Python linter ...)
	@VALIDATE_PYTHON=true $(MAKE) lint-all

lint-yaml:
	@$(call msg, Running YAML linter ...)
	@VALIDATE_YAML=true $(MAKE) lint-all

lint-githubactions:
	@$(call msg, Running GitHub Actions linter ...)
	@VALIDATE_GITHUB_ACTIONS=true \
	GITHUB_ACTIONS_COMMAND_ARGS="-ignore SC2043 -ignore SC2011 -ignore SC2035 -ignore SC2156 -ignore SC2038 -ignore SC2061 -ignore SC2129 -ignore \".+\" section is missing in workflow -ignore unexpected key \".+\" for \"workflow\" section" \
		$(MAKE) lint-all

lint-bash:
	@$(call msg, Running Bash linter ...)
	@VALIDATE_BASH=true $(MAKE) lint-all

lint-json:
	@$(call msg, Running JSON linter ...)
	@VALIDATE_JSON=true $(MAKE) lint-all

lint-markdown:
	@$(call msg, Running Markdown linter ...)
	@VALIDATE_MARKDOWN=true $(MAKE) lint-all

image:
	@$(call msg, Building Docker image ${DOCKER_IMAGE_NAME} ...)
	@docker build --rm . -t ${DOCKER_IMAGE_NAME}

source-package:
	@# Help: Create source package tarball
	git archive --format=zip -o multicam-demo-$(VERSION).zip HEAD \
		.gitignore CMakeLists.txt Dockerfile Makefile README.md REUSE.toml robotics-project.json \
		.github/linters cmake docs images LICENSES src tests videos

yolov8_models: image
	@$(call msg, Preparing the yolov8 models ...)
	@docker run ${DOCKER_RUN_PARAMS} bash -c ' \
		source /opt/intel/oneapi/setvars.sh && source /opt/intel/openvino/setupvars.sh  && \
		/workspace/scripts/yolov8_model_prepare.sh yolov8n yolov8s yolov8m yolov8n-seg yolov8s-seg yolov8m-seg \
		'

mobilenet_models: image
	@$(call msg, Preparing the mobilenet models ...)
	@docker run ${DOCKER_RUN_PARAMS} bash -c ' \
		source /opt/intel/oneapi/setvars.sh  && source /opt/intel/openvino/setupvars.sh  && \
		rm -rf ./models/mobilenet-ssd && \
			omz_downloader --name mobilenet-ssd && omz_converter --name mobilenet-ssd && \
			mv ./public/mobilenet-ssd ./models && rm -rf ./public\
		'

models:  yolov8_models mobilenet_models

demo:
	@$(call msg, Running the RealSense AI Demo ...)
	@xhost +
	@docker run ${DOCKER_RUN_PARAMS} \
		bash -c 'cd src && source /opt/intel/oneapi/setvars.sh && source /opt/intel/openvino/setupvars.sh &> /dev/null && \
				  python3 pyrealsense2_ai_demo_launcher.py --config=../config/config.js'

bash: image
	@xhost +
	@docker run ${DOCKER_RUN_PARAMS} bash

clean:
	@# Help: Remove local build, package, and test artifacts and the demo Docker image
	rm -rf $(BUILD_DIR) 2>/dev/null || \
		docker run --rm -v $(ROOT_DIR):/workspace $(CONTAINER_IMAGE) rm -rf /workspace/build
	docker rmi ${DOCKER_IMAGE_NAME} 2>/dev/null || echo "No such image: ${DOCKER_IMAGE_NAME}"

help:
	@printf "%-20s %s\n" "Target" "Description"
	@printf "%-20s %s\n" "------" "-----------"
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
				printf "%-20s %s\n", target, help_line; \
				target = ""; \
			} \
		}' | sort -k1,1

#----------------------------------------------------------------------------------------------------------------------
# helper functions
#----------------------------------------------------------------------------------------------------------------------
define msg
	tput setaf 2 2>/dev/null || true && \
	for i in $(shell seq 1 120 ); do echo -n "-"; done; echo  "" && \
	echo "         "$1 && \
	for i in $(shell seq 1 120 ); do echo -n "-"; done; echo "" && \
	tput sgr0 2>/dev/null || true
endef
