# System Requirements

The Robotics AI Suite supports the platform and middleware configurations below.
Each Blueprint defines the hardware, drivers, packages, and peripherals that
have been validated for its workflows.

## Supported Intel® Processors

The Robotics AI Suite is validated on the Intel® processor series below. Each
series combines CPU, integrated graphics, and an NPU to run perception, planning,
and control workloads on a single platform. Select a series to view its full
specifications on Intel® ARK.

::::{grid} 3
:gutter: 3

:::{grid-item-card}
:img-top: images/intel-core-ultra-series-3.png
:link: https://www.intel.com/content/www/us/en/ark/products/series/245528/intel-core-ultra-series-3-processors.html
:link-type: url
:link-alt: Intel Core Ultra Series 3 Processors on Intel ARK
:text-align: center

**Intel® Core™ Ultra Series 3 Processors**
:::

:::{grid-item-card}
:img-top: images/intel-core-series-3.jpg
:link: https://www.intel.com/content/www/us/en/products/details/processors/core.html
:link-type: url
:link-alt: Intel Core Series 3 Processors
:text-align: center

**Intel® Core™ Series 3 Processors**
:::

:::{grid-item-card}
:img-top: images/intel-core-ultra-series-2.png
:link: https://www.intel.com/content/www/us/en/ark/products/series/241071/intel-core-ultra-processors-series-2.html
:link-type: url
:link-alt: Intel Core Ultra Series 2 Processors on Intel ARK
:text-align: center

**Intel® Core™ Ultra Series 2 Processors**
:::
::::

## Supported Operating Systems

| OS Distribution | OS Version | OS Variant |
| --- | --- | --- |
| Canonical Ubuntu | 24.04 LTS (Noble Numbat) | 64-bit Desktop |
| Canonical Ubuntu | 22.04 LTS (Jammy Jellyfish) | 64-bit Desktop |

## Supported Configurations

```{include} getting_started/fragment_configurations.md
```

Use the [Runtime](../components/runtime/index.md) guidance to configure
the ROS 2 distribution for the selected system profile. Before installing a
robot application, review its Blueprint for compatible hardware, sensor,
firmware, and package requirements.

## Additional Requirements

- Internet connectivity is required during initial installation.
- You should be familiar with executing Linux commands.
- A ROS 2 background is strongly recommended.

Individual Blueprints and how-to guides can require additional robot hardware,
sensors, software packages, or peripherals. Review their prerequisites before
starting a specific workflow.

## Next Steps

Learn more about the support development kits:

- **[Development Kits](development_kits/index.md)** — select a development kit to get started with.

Bring your own system and continue to the Installation & Setup guide:

- **[Installation & Setup](getting_started.md)** — set up your system for the Robotics AI Suite.

