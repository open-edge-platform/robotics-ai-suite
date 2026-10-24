# Development Kits

A development kit is a ready-to-use hardware platform that pairs an Intel processor
with a carrier card and the I/O, sensor, and connectivity interfaces needed to
prototype and validate robotics workloads. Each kit is documented with its setup
steps, supported operating systems, and interface configuration so you can bring up
the hardware and start development quickly.

> [!NOTE]
> The development kits listed on this page are those that have been tested with the
> Robotics AI Suite. For a comprehensive catalog of partner Edge AI systems
> see [Edge AI Partner Spotlight](https://builders.intel.com/ecosystem-engagement/solution-hub/edge-ai-catalog/partner-spotlight?cp=53&cid=202&type=system).


| Development Kit | Silicon | Product Link | Notes |
| --- | --- | --- | --- |
| [AAEON CEXD-INTRBL](robinson-bay/index.md) | Intel® Core™ Ultra X7 358H (Intel® Core™ Ultra Series 3) | [link](https://builders.intel.com/ecosystem-engagement/solution-hub/edge-ai-catalog/partner-spotlight/cexd-intrbl-141) | Compute module (100 × 87 mm) with a carrier card breaking out I/O, MIPI CSI, GMSL, and SerDes connectivity. For research and development use only. |
| [AAEON UP Nexus WCL Edge](up-nexus-wcl-edge/index.md) | Intel® Core™ 7 processor 360 / Core™ 5 processor 320 | [link](https://builders.intel.com/ecosystem-engagement/solution-hub/edge-ai-catalog/partner-spotlight/aaeon-up-nexus-wcl-edge-269) | Fanless edge system with onboard LPDDR5 memory and dual 2.5GbE. No GMSL or MIPI CSI camera connectivity — use USB cameras. For research and development use only. |
| [AAEON UP WCL Edge](up-wcl-edge/index.md) | Intel® Core™ 7 processor 350 / Core™ 5 processor 320 / Core™ 3 processor 304 | [link](https://www.aaeon.com/en/product/detail/up-systems-up-wcl-edge) | Compact edge system with an active cooler and onboard LPDDR5 memory. No GMSL or MIPI CSI camera connectivity — use USB cameras. For research and development use only. |
| [ASUS NUC 16](asus-nuc-16/index.md) | Intel® Core™ Series 3 processors | [link](https://builders.intel.com/ecosystem-engagement/solution-hub/edge-ai-catalog/partner-spotlight/asus-nuc-16-338) | Ultra-compact, tool-less upgradeable system with up to 64 GB DDR5-6400 memory, Wi-Fi 7, and dual LAN. No GMSL or MIPI CSI camera connectivity — use USB cameras. For research and development use only. |

## Supported Configurations

```{include} ../getting_started/fragment_configurations.md
```

Use the [Runtime](../../components/runtime/index.md) guidance to configure the ROS 2
distribution for the selected system profile. Before installing a robot application,
review its Blueprint for compatible hardware, sensor, firmware, and package
requirements.


:::{toctree}
:caption: Development Kits
:hidden:

AAEON CEXD-INTRBL <robinson-bay/index>
AAEON UP Nexus WCL Edge <up-nexus-wcl-edge/index>
AAEON UP WCL Edge <up-wcl-edge/index>
ASUS NUC 16 <asus-nuc-16/index>
:::
