#!/usr/bin/env python3
# Copyright (C) 2026 Intel Corporation
# SPDX-License-Identifier: Apache-2.0
#
# These contents may have been developed with support from one or more
# Intel-operated generative artificial intelligence solutions.
"""
fastdds_peers.py — Fast DDS profile that unicast-discovers every participant on a remote host.

``ROS_STATIC_PEERS`` gives Fast DDS a peer address without a port, which it
expands to only the first few participant ports (``maxInitialPeersRange``,
default 4). A robot runs one participant per ROS process (a Clearpath Jackal
runs about 30), so most of its nodes are never contacted when multicast does
not reach the monitoring machine (another subnet, a container behind NAT).

This writes an initial-peers list with the metatraffic unicast port of every
participant ID on the remote, from the RTPS well-known port formula:

    7400 + 250 * domain_id + 10 + 2 * participant_id

plus the default multicast group, so local discovery keeps working.

Usage:
    python3 fastdds_peers.py --host 10.0.0.5 --domain 74 --out /tmp/peers.xml
"""

from __future__ import annotations

import argparse
import socket
from pathlib import Path

PB, DG, PG, D1 = 7400, 250, 2, 10
DEFAULT_PARTICIPANTS = 120
MULTICAST_GROUP = "239.255.0.1"


def unicast_ports(domain_id: int, participants: int = DEFAULT_PARTICIPANTS) -> list[int]:
    """Metatraffic unicast ports for up to `participants` IDs within the UDP port range."""
    if not 0 <= domain_id <= 232:
        raise ValueError(f"ROS_DOMAIN_ID must be 0-232, got {domain_id}")
    base = PB + DG * domain_id + D1
    max_participants = (65535 - base) // PG + 1
    return [base + PG * pid for pid in range(min(participants, max_participants))]


def profile_xml(host: str, domain_id: int, participants: int = DEFAULT_PARTICIPANTS) -> str:
    """Fast DDS XML with a default participant profile listing every peer port on `host`."""
    # Locators take IPv4 addresses only.
    host = socket.gethostbyname(host)
    locators = [
        f"<locator><udpv4><address>{host}</address><port>{port}</port></udpv4></locator>"
        for port in unicast_ports(domain_id, participants)
    ]
    locators.append(f"<locator><udpv4><address>{MULTICAST_GROUP}</address></udpv4></locator>")
    locators.append("<locator><udpv4><address>127.0.0.1</address></udpv4></locator>")
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<dds xmlns="http://www.eprosima.com"><profiles>'
        '<participant profile_name="remote_peers" is_default_profile="true">'
        "<rtps><builtin><initialPeersList>\n"
        + "\n".join(locators)
        + "\n</initialPeersList></builtin></rtps></participant></profiles></dds>\n"
    )


def write_profile(host: str, domain_id: int, out: str | Path,
                  participants: int = DEFAULT_PARTICIPANTS) -> Path:
    """Write the profile to `out` and return its path."""
    path = Path(out)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(profile_xml(host, domain_id, participants))
    return path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--host", required=True, help="Remote host IP")
    parser.add_argument("--domain", type=int, required=True, help="ROS_DOMAIN_ID")
    parser.add_argument("--out", required=True, help="Output XML path")
    parser.add_argument("--participants", type=int, default=DEFAULT_PARTICIPANTS,
                        help=f"Participant IDs to cover (default {DEFAULT_PARTICIPANTS})")
    args = parser.parse_args()
    print(write_profile(args.host, args.domain, args.out, args.participants))


if __name__ == "__main__":
    main()
