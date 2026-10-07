# SPDX-FileCopyrightText: (C) 2025 Intel Corporation
# SPDX-License-Identifier: Apache-2.0

.DEFAULT_GOAL := help
.PHONY: help build website serve test-website build-components test package

PROJECT_NAME := robotics-ai-suite

build: website ## Build the documentation website

website: ## Build the documentation website
	npm ci --prefix docs/website
	npm run build --prefix docs/website

test-website: ## Test the built documentation website
	test -s docs/website/build/index.html
	test -s docs/website/build/development-stack/ai-suite-robotics/index.html
	npm run test:website --prefix docs/website

serve: ## Build and serve the documentation website locally
	@set -eu; \
	snapshot=$$(mktemp -d); \
	trap 'rm -rf "$$snapshot"' EXIT; \
	exec 9>docs/website/.serve.lock; \
	flock 9; \
	npm ci --prefix docs/website; \
	npm run build --prefix docs/website; \
	cp -a docs/website/build/. "$$snapshot/"; \
	flock -u 9; \
	SITE_BUILD_DIR="$$snapshot" npm run serve --prefix docs/website

build-components: ## Build all component packages (not implemented)
	@echo "Not implemented: component CMake build orchestration is pending." >&2; exit 1

test: ## Test all component packages (not implemented)
	@echo "Not implemented: component test orchestration is pending." >&2; exit 1

package: ## Package all components (not implemented)
	@echo "Not implemented: component package orchestration is pending." >&2; exit 1

help: ## Print help for each target
	@echo $(PROJECT_NAME) make targets
	@echo "Target               Makefile:Line    Description"
	@echo "-------------------- ---------------- -----------------------------------------"
	@grep -H -n '^[[:alnum:]_-]*:.* ##' $(MAKEFILE_LIST) \
    | sort -t ":" -k 3 \
    | awk 'BEGIN  {FS=":"}; {sub(".* ## ", "", $$4)}; {printf "%-20s %-16s %s\n", $$3, $$1 ":" $$2, $$4};'
