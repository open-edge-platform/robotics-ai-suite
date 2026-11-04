#!/bin/bash
# Copyright (C) 2026 Intel Corporation
# SPDX-License-Identifier: Apache-2.0
#
# These contents may have been developed with support from one or more
# Intel-operated generative artificial intelligence solutions.
# wandering_jackal_run.sh — Thin wrapper around benchmark_runner.sh for the
# wandering scenario on physical Clearpath Jackal hardware (AAEON UP Nexus
# WCL Edge onboard compute). Requires the Clearpath base services already
# running on the robot.
#
# Intended to run FROM a separate workstation, connecting to the Jackal's WCL
# Edge board over SSH/DDS: set `remote.host` in config/wandering_jackal_run.yaml
# (or pass --remote-ip) to the board's IP/hostname. launch.cmd then runs on
# the robot over SSH while this script, bag recording, and monitoring all run
# locally on your workstation. Leave `remote.host` empty to instead run this
# whole script directly on the WCL Edge board (no SSH hop).
#
# All CLI options are forwarded to benchmark_runner.sh unchanged.
# To customise the launch command, ROBOT_NAMESPACE, remote host/user, bag
# topics, stop condition, or any other scenario behaviour, edit
# config/wandering_jackal_run.yaml instead of this file.
#
# Usage:
#   bash src/wandering_jackal_run.sh [--goals N] [--timeout SECS] [--record] [--plot]
#                                     [--output-parent DIR] [--side-terminals]
#                                     [--remote-ip HOST] [--remote-user USER]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
exec "$SCRIPT_DIR/benchmark_runner.sh" \
  --run-config "$REPO_ROOT/config/wandering_jackal_run.yaml" \
  "$@"
