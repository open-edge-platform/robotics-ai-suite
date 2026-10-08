# Copilot Instructions for Robotics AI Suite

## Repository Overview

This repository contains the Robotics AI Suite:

- `src/components/` — ROS 2 components and applications, including mapping, navigation, perception, simulation, and benchmarking
- `src/pipelines/` — sample robotics and OpenVINO pipelines
- `src/robot-vision-control/` — stationary robot vision and control
- `docs/user-guide/` — Sphinx technical documentation
- `docs/website/` — Docusaurus website that includes the built user guide

Check the component's `README.md` and any local `AGENTS.md` before changing it.

## Languages & Frameworks

- **Robotics:** C++ and Python with ROS 2, CMake, colcon, and launch files
- **ML/AI:** OpenVINO and PyTorch in relevant components and pipelines
- **Documentation and website:** Sphinx/MyST and Docusaurus (JavaScript/TypeScript)
- **Supporting tooling:** Bash, Make, and component-specific container or packaging files

## Build Systems

- Run `make help` at the root or within a component to discover available targets. Root `make build`, `make website`, and `make serve` build or serve the documentation website; root `make build-components`, `make test`, and `make package` are not implemented.
- Use `make -C docs build` for the Sphinx user guide and `make test-website` after building the complete site.
- ROS 2 components have their own Make/CMake/colcon workflows. Use the relevant component's README and Makefile for build and test commands.
- Python packages and containerized pipelines have local dependency and deployment instructions; do not assume one deployment mechanism applies across the repository.

## Testing Patterns

- ROS 2 components use Google Test, launch testing, and/or pytest as documented by each component.
- Python packages use local pytest configuration where available; do not assume a repository-wide test layout or marker set.
- The documentation website has Playwright integration tests via `make test-website`.

## Linting & Formatting

- Follow the component's Makefile and local lint configuration for Python, C++, and shell changes.
- Validate documentation with the Sphinx build and website tests when affected.

## Docker Patterns

- Check the specific component or pipeline for its container build and device requirements; many ROS 2 components also support native builds.
- Use environment variables or uncommitted `.env` files for credentials. Pin production image versions; do not introduce `:latest`.

## CI/CD Workflows

- GitHub Actions in `.github/workflows/`
- Website deployment and component workflows live in `.github/workflows/`; consult the relevant workflow before assuming which tests or scans run.
- Keep action permissions scoped and pin third-party actions to full commit SHAs.

## License Conventions

**All generated source files must include both lines below** using language-appropriate comment syntax:

```
# SPDX-FileCopyrightText: (C) <YEAR> Intel Corporation
# SPDX-License-Identifier: Apache-2.0
```

- Use the current year. Preserve the exact SPDX field names — do not paraphrase them.
- For file types that cannot contain comments (for example, binaries), use REUSE-compliant metadata in the component `LICENSES/` directory.

## Agent Behavior

### Scope
- **Stay within the component or documentation area being asked about.** Do not modify unrelated components or pipelines unless explicitly instructed.
- Before editing, read the target file and the local `README.md`. If a local `AGENTS.md` exists, treat it as the authoritative override for that component.
- Do not add features, refactor code, introduce new dependencies, or change APIs beyond what was directly requested.

### Context management
- Load only files relevant to the current task; do not speculatively read other components or pipelines.
- Prefer `make help` in the relevant directory to discover available targets.
- Prefer targeted search over reading entire directories.

## Key Conventions

1. **ROS 2** components rely on local launch, build, and package instructions; select the supported ROS distribution for the component.
2. **OpenVINO** pipelines may select CPU, GPU, or NPU devices; follow the relevant pipeline's configuration rather than assuming a universal device variable.
3. **Environment variables** drive configuration; do not hardcode or commit secrets.
4. **Container and proxy configuration** is component-specific; preserve existing `HTTP_PROXY`/`HTTPS_PROXY`/`NO_PROXY` handling where present.
5. **Shell strict mode** — use `set -euo pipefail` for Bash scripts (`#!/usr/bin/env bash`) and `set -eu` for `sh` scripts.

## Security

### General Guardrails (Always-On)

- Prefer least privilege across code, services, identities, file permissions, APIs, containers, and workflows.
- Treat all external input as untrusted; validate format, type, range, and length at trust boundaries.
- Never hard-code secrets, credentials, keys, tokens, or passwords anywhere; use environment variables only.
- Avoid exposing sensitive data in logs, traces, errors, metrics, or test artifacts.
- Prefer trusted, actively maintained dependencies and images; pin versions.
- Do not suggest bypassing or weakening existing security checks or validations.
- Fail safely and visibly; be explicit about assumptions and limitations.

### Codebase-Specific Guardrails

**Python**
- Never use `subprocess(..., shell=True)` with any external or user-controlled input; always pass a list: `subprocess.run([cmd, arg], shell=False)`.
- Never use `eval()`, `exec()`, or `pickle.loads()` on untrusted data.
- In FastAPI services, validate all request bodies with Pydantic models — never accept raw `dict` or unvalidated JSON.
- Use `secrets` module or environment variables for token generation; never use `random` for security-sensitive values.

**Docker / Containers**
- All Dockerfiles must include a non-root `USER` directive before the final `CMD`/`ENTRYPOINT`.
- Never use `--privileged`, `--cap-add=ALL`, or `--network=host` in Compose or runtime commands without explicit justification.
- Never use `pip install --trusted-host`, `--no-verify`, or unauthenticated `--index-url` sources.
- Never log, print, or `echo` `.env` file contents; never commit `.env` files.

**Shell scripts**
- Never construct shell commands by interpolating unvalidated variables; quote all variables: `"$var"`.
- Use `set -euo pipefail` (bash) or `set -eu` (sh); never use `set +e` to swallow errors silently.

**Helm / Kubernetes**
- Never set `hostNetwork: true`, `privileged: true`, or `runAsUser: 0` in pod specs without a documented exception.
- Pin all image tags in Helm `values.yaml`; avoid `:latest`.

**CI/CD**
- Pin all GitHub Actions to full commit SHAs, not tags.
- Never use `persist-credentials: true` unless required; scope tokens to minimum permissions.

### AI Output Trust Model

Treat AI-generated output as **untrusted draft code** until reviewed and tested.
Reject suggestions that bypass security controls for convenience or introduce unsafe defaults.

Load [`./skills/security-review/SKILL.md`](./skills/security-review/SKILL.md) when changes touch authentication, authorization, input parsing, secrets, Dockerfiles, Helm charts, or CI workflows.

## Contributing

See [`CONTRIBUTING.md`](../CONTRIBUTING.md) for PR guidelines and commit signing requirements.
