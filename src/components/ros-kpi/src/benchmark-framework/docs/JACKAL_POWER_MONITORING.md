<!--
Copyright (C) 2026 Intel Corporation

SPDX-License-Identifier: Apache-2.0

These contents may have been developed with support from one or more
Intel-operated generative artificial intelligence solutions.
-->
# Clearpath Jackal (J100) + AAEON WCL — Power Monitoring Reference

Reference notes for measuring power usage of the Jackal's motors, MCU, and an
AAEON WCL board installed on the 12V user power terminal block, using the
onboard MCU telemetry instead of splicing in external power-monitor ICs.

Applies to Jackals running the newer Clearpath ROS 2 stack (`clearpath_robot`,
`clearpath_platform_msgs`), as used by the
[Robotics AI Suite Clearpath Jackal blueprint](https://developer.robotics.intel.com/development-stack/hardware_blueprints/amr/clearpath-jackal/index.html).

## TL;DR

You don't need to splice in power-monitoring ICs for basic per-rail current/voltage
telemetry — the Jackal's MCU already publishes it over two ROS 2 topics.

## 1. `/platform/mcu/status/power` — `clearpath_platform_msgs/msg/Power`

Published directly by the MCU (`SensorDataQoS`, best-effort).

**`measured_voltages[3]`** (volts):

| Index constant | Meaning |
|---|---|
| `J100_MEASURED_BATTERY` | Raw battery bus voltage |
| `J100_MEASURED_5V` | Regulated 5V rail |
| `J100_MEASURED_12V` | Regulated 12V rail |

**`measured_currents[4]`** (amps):

| Index constant | Meaning |
|---|---|
| `J100_TOTAL_CURRENT` | Total current drawn from the battery |
| `J100_COMPUTER_CURRENT` | Current on the stock onboard-computer power port |
| `J100_DRIVE_CURRENT` | Combined current for both motor driver channels |
| `J100_USER_CURRENT` | Current on the **12V user power terminal block** (where the WCL is connected) |

**WCL board power estimate:**

```
P_wcl (W) ≈ J100_USER_CURRENT × J100_MEASURED_12V
```

Valid only if nothing else shares that user-power terminal block.

## 2. `/platform/motors/feedback` — `clearpath_platform_msgs/msg/Feedback`

Contains a `DriveFeedback[2]` array, one entry per side's motor-driver board
(left/right), each with:

- `current` — bus current into that side's MOSFET H-bridge (motor + driver current for that side)
- `duty_cycle`
- `bridge_temperature`, `motor_temperature`
- `measured_velocity`, `measured_travel`
- `driver_fault`

**Per-side motor power estimate:**

```
P_side (W) ≈ DriveFeedback[i].current × J100_MEASURED_BATTERY
```

## What's NOT separately measured

- **MCU itself**: no dedicated shunt; its draw is lumped into the overall rail
  totals and is normally sub-watt / negligible.
- **Per-motor (not per-side)**: each side's two motors share one driver/H-bridge,
  so you only get left/right totals, not 4 individual motor currents.
- **5V rail current**: only voltage is reported for 5V, no current channel.

## Quick check commands

```bash
ros2 topic echo /platform/mcu/status/power
ros2 topic echo /platform/motors/feedback
```

Topic names may be namespaced (e.g. `/<robot_namespace>/platform/mcu/status/power`)
depending on the `system.ros2.namespace` setting in `/etc/clearpath/robot.yaml`.

## When to still splice in a power-monitor IC (e.g. INA226/INA260)

- You need a higher sample rate or finer resolution than the MCU's averaged
  report period.
- Multiple loads share the 12V user rail and you need to isolate just the
  WCL's draw.
- You want bus-voltage ripple / instantaneous transient data (e.g. WCL boot
  inrush current) rather than MCU-averaged values.

## Key references

- Message definitions: [clearpathrobotics/clearpath_msgs](https://github.com/clearpathrobotics/clearpath_msgs)
  (`clearpath_platform_msgs/msg/Power.msg`, `Feedback.msg`, `DriveFeedback.msg`)
- Hardware interface source: [clearpathrobotics/clearpath_robot](https://github.com/clearpathrobotics/clearpath_robot)
  (`clearpath_hardware_interfaces/src/j100/`, `src/diff_drive/`)
- Clearpath Robotics ROS 2 docs: <https://docs.clearpathrobotics.com/docs/ros/>
- Robotics AI Suite Jackal blueprint: <https://developer.robotics.intel.com/development-stack/hardware_blueprints/amr/clearpath-jackal/index.html>
