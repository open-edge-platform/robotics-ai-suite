#!/usr/bin/env python3
# Copyright (C) 2026 Intel Corporation
# SPDX-License-Identifier: Apache-2.0
#
# These contents may have been developed with support from one or more
# Intel-operated generative artificial intelligence solutions.
"""
Unit tests for remote-mode helpers.

Covers:
  fastdds_peers.unicast_ports / profile_xml  — RTPS port formula and XML profile
  monitor_resources._gpu_sysfs_layout        — i915 and xe sysfs discovery
  benchmark_profiler.RunConfig remote.setup  — parsing and CONF_REMOTE_SETUP export
"""

import re
import subprocess
from pathlib import Path
from types import SimpleNamespace

import pytest

import monitor_resources
from benchmark_profiler import RunConfig
from fastdds_peers import profile_xml, unicast_ports

LOCATOR = re.compile(r"<udpv4><address>([^<]+)</address>(?:<port>(\d+)</port>)?</udpv4>")


@pytest.mark.parametrize(("domain", "first", "second"), [(0, 7410, 7412), (74, 25910, 25912)])
def test_unicast_ports(domain, first, second):
    ports = unicast_ports(domain, participants=3)
    assert ports == [first, second, second + 2]


def test_unicast_ports_rejects_bad_domain():
    with pytest.raises(ValueError, match="0-232"):
        unicast_ports(233)


def test_profile_lists_every_participant_plus_local_discovery():
    xml = profile_xml("10.0.0.5", 74, participants=40)
    assert 'is_default_profile="true"' in xml
    assert "<initialPeersList>" in xml
    peers = LOCATOR.findall(xml)
    remote_ports = [int(port) for addr, port in peers if addr == "10.0.0.5"]
    assert remote_ports == unicast_ports(74, 40)
    assert {addr for addr, port in peers if addr != "10.0.0.5"} == {"239.255.0.1", "127.0.0.1"}


def _fake_probe(monkeypatch, stdout):
    monitor_resources._GPU_LAYOUT_CACHE.clear()
    monkeypatch.setattr(monitor_resources, "_ssh",
                        lambda *a, **k: SimpleNamespace(stdout=stdout, returncode=0))
    monkeypatch.setattr(subprocess, "run",
                        lambda *a, **k: SimpleNamespace(stdout=stdout, returncode=0))


def test_gpu_layout_xe(monkeypatch):
    c = "/sys/class/drm/card0"
    _fake_probe(monkeypatch, f"CARD={c}\n{c}/device/tile0/gt0\n{c}/device/tile0/gt1\n")
    layout = monitor_resources._gpu_sysfs_layout("10.0.0.5", "intel")
    assert layout["driver"] == "xe"
    assert layout["idle_paths"] == [f"{c}/device/tile0/gt0/gtidle/idle_residency_ms",
                                    f"{c}/device/tile0/gt1/gtidle/idle_residency_ms"]
    assert layout["freq_paths"][0] == f"{c}/device/tile0/gt0/freq0/act_freq"


def test_gpu_layout_i915(monkeypatch):
    c = "/sys/class/drm/card1"
    _fake_probe(monkeypatch, f"CARD={c}\n{c}/gt/gt0\n")
    layout = monitor_resources._gpu_sysfs_layout()
    assert layout["driver"] == "i915"
    assert layout["idle_paths"] == [f"{c}/gt/gt0/rc6_residency_ms"]
    assert layout["freq_paths"] == [f"{c}/gt_act_freq_mhz", f"{c}/gt_cur_freq_mhz",
                                    f"{c}/gt_max_freq_mhz"]


def test_gpu_layout_none(monkeypatch):
    _fake_probe(monkeypatch, "")
    assert monitor_resources._gpu_sysfs_layout("10.0.0.5") == {}
    assert monitor_resources._read_sysfs_gpu("10.0.0.5") == {}


def test_remote_setup(tmp_path: Path):
    cfg = tmp_path / "run.yaml"
    cfg.write_text(
        "launch:\n  cmd: ros2 launch pkg x.launch.py\n"
        "remote:\n  host: 10.0.0.5\n  setup: /etc/clearpath/setup.bash\n"
        "bag:\n  topics: [/scan]\n"
    )
    rc = RunConfig.load(cfg)
    assert rc.remote_setup == "/etc/clearpath/setup.bash"
    assert "CONF_REMOTE_SETUP=/etc/clearpath/setup.bash" in rc.export_bash()


def test_remote_setup_defaults_empty(tmp_path: Path):
    cfg = tmp_path / "run.yaml"
    cfg.write_text("launch:\n  cmd: ros2 launch pkg x.launch.py\nbag:\n  topics: [/scan]\n")
    assert "CONF_REMOTE_SETUP=''" in RunConfig.load(cfg).export_bash()
