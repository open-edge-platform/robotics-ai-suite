# ROS 2 Runtime

The Robotics AI Suite uses the Robot Operating System 2 (ROS 2) as its primary runtime execution engine, communication middleware, and lifecycle manager. ROS 2 provides the modular backbone that interconnects sensor ingestion, hardware abstraction, artificial intelligence inference, autonomous navigation, robotic manipulation, and deterministic motor control into a unified software stack.

The suite standardizes on **ROS 2 Jazzy Jalisco** running on **Canonical Ubuntu 24.04 LTS (Noble Numbat)** across supported Intel platforms (with **ROS 2 Humble Hawksbill** supported on **Ubuntu 22.04 LTS** for select workflows). For hardware and platform prerequisites, refer to the [System Requirements](../../platform_foundation/system_requirements.md).


## Installing & Configuring ROS 2

### Choose an Installation Path

ROS 2 is installed automatically when using the Robotics AI Suite installer, or you can install it directly from the official Open Robotics Ubuntu repositories:

::::{grid} 2

:::{grid-item-card} **Express or Image Setup (Recommended)**
:link: ../../platform_foundation/getting_started
:link-type: doc
:link-alt: clickable cards

Install ROS 2 Jazzy alongside Intel GPU/NPU drivers, OpenVINO™, and Robotics AI Suite packages automatically using Express Setup or Image Composer.
:::

:::{grid-item-card} **Step-by-Step Manual Suite Setup**
:link: ../../platform_foundation/getting_started/step_by_step
:link-type: doc
:link-alt: clickable cards

Configure the ROS 2 APT repository (`ros2-apt-source`), OpenVINO™, RealSense, and Robotics AI Suite Debian packages manually step by step.
:::

:::{grid-item-card} **Official ROS 2 Jazzy Guide (Ubuntu 24.04)**
:link: https://docs.ros.org/en/jazzy/Installation/Ubuntu-Install-Debs.html
:link-type: url
:link-alt: Official ROS 2 Jazzy installation documentation

Upstream Open Robotics Debian package installation instructions, repository setup, and RMW options for Ubuntu 24.04 LTS (Noble).
:::

:::{grid-item-card} **Official ROS 2 Humble Guide (Ubuntu 22.04)**
:link: https://docs.ros.org/en/humble/Installation/Ubuntu-Install-Debs.html
:link-type: url
:link-alt: Official ROS 2 Humble installation documentation

Upstream Open Robotics Debian package installation instructions and repository setup for Ubuntu 22.04 LTS (Jammy).
:::
::::

### Environment Setup

To initialize the ROS 2 environment in your terminal session, source the setup script for your distribution:

::::{tab-set}
:::{tab-item} **Jazzy (Ubuntu 24.04)**
:sync: jazzy

```bash
source /opt/ros/jazzy/setup.bash
```

To automatically configure every new shell, append the command to your `~/.bashrc`:

```bash
echo "source /opt/ros/jazzy/setup.bash" >> ~/.bashrc
```

:::
:::{tab-item} **Humble (Ubuntu 22.04)**
:sync: humble

```bash
source /opt/ros/humble/setup.bash
```

To automatically configure every new shell, append the command to your `~/.bashrc`:

```bash
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
```

:::
::::

### Network Domain Isolation (`ROS_DOMAIN_ID`)

When multiple robots or development workstations share the same local network, isolate their DDS message traffic by assigning a distinct `ROS_DOMAIN_ID` (integer between `0` and `101`):

```bash
export ROS_DOMAIN_ID=42
```

> [!NOTE]
> Assign each physical robot or independent simulation session a unique `ROS_DOMAIN_ID` to prevent node collisions and cross-talk on the local subnet.

### Verifying the Runtime

Verify your ROS 2 runtime and environment configuration:

1. Check runtime environment health:

   ```bash
   ros2 doctor
   ```

2. Test communication between two nodes:

   In one terminal, start a publisher:
   ```bash
   ros2 run demo_nodes_cpp talker
   ```

   In a second terminal, start a subscriber:
   ```bash
   ros2 run demo_nodes_py listener
   ```

3. Inspect active nodes and topics:

   ```bash
   ros2 node list
   ros2 topic list
   ```


## Architecture & Core Capabilities

ROS 2 delivers an industrial-grade, distributed architecture designed for robotics systems with demanding performance, reliability, and real-time constraints.

### Publish-Subscribe, Services, and Actions

Robotics AI Suite applications communicate across processes and distributed compute nodes using standard ROS 2 communication primitives:

- **Topics (Publish-Subscribe)**: Unidirectional streaming for continuous, high-throughput data such as camera video frames (`sensor_msgs/Image`), 3D point clouds (`sensor_msgs/PointCloud2`), and odometry measurements (`nav_msgs/Odometry`).
- **Services (Request-Response)**: Synchronous or asynchronous two-way communication for configuration queries, mode switches, and calibration requests.
- **Actions (Goal-Feedback-Result)**: Long-running preemptible task execution with real-time feedback, utilized by Nav2 navigation goals and MoveIt 2 trajectory executions.

### Data Distribution Service (DDS) & Zero-Copy Transport

Communication in ROS 2 relies on Data Distribution Service (DDS) middleware implementations such as Fast DDS and Cyclone DDS. The Robotics AI Suite takes advantage of:

- **Intra-Process Communication (IPC)**: Minimizes serialization and socket overhead by using shared memory and loaned messages (`rclcpp::LoanedMessage`) to achieve zero-copy data passing between co-located nodes. This is critical for high-resolution vision and volumetric point-cloud pipelines.
- **Quality of Service (QoS) Tuning**: Configurable reliability (reliable vs. best-effort), durability (transient local vs. volatile), history depth, and deadline/liveliness policies to prioritize critical motor control commands over best-effort diagnostic telemetry.

### Managed Node Lifecycles & Composable Nodes

- **Lifecycle Nodes (`rclcpp_lifecycle`)**: Provides deterministic state-machine management (`unconfigured`, `inactive`, `active`, `finalized`). This allows orchestrating complex robotic graphs where sensor drivers must reach active states before navigation or AI perception nodes begin execution.
- **Composable Nodes & Component Containers**: Packages multiple functional nodes into dynamic shared libraries loaded inside a single runtime process container (`rclcpp_components`), eliminating process boundaries while preserving modular code organization.


## Robotics AI Suite Integration

ROS 2 serves as the central orchestration bus connecting all components in the Robotics AI Suite:

- **AI Perception & Inference**: Interconnects camera feeds with the [OpenVINO™ Toolkit](../../ai_resources/openvino/index.md) inference engine. Vision nodes publish inference bounding boxes, segmented masks, and classification outputs onto standard ROS 2 topics for downstream planning.
- **Sensors**: Interfaces with [Sensors](../sensors/index.md) including RealSense depth cameras (`realsense2_camera`), industrial USB/GMSL vision sensors, and 2D/3D LiDARs.
- **Navigation**: Powers the Nav2 stack, augmented by Intel-optimized components such as the [ITS Path Planner](../navigation/its-path-planner-plugin.md), [Fast Mapping](../navigation/run-fastmapping-algorithm.md), and [Robot Re-localization](../navigation/navigation-relocalization.md).
- **Manipulation**: Integrates MoveIt 2 and MoveIt 2 Servo for Cartesian velocity jog and trajectory execution on multi-axis robotic arms.
- **Real-Time Determinism**: Operates alongside [Real-time Linux PREEMPT_RT](../realtime_determinism/realtime_linux.md) kernels and fieldbuses such as the [IgH EtherCAT Master Stack](../realtime_determinism/ethercat.md) to execute hard real-time control loops.
- **Simulation**: Enables digital-twin testing with [Gazebo Simulation](../simulation/index.md) for full software-in-the-loop (SITL) validation before physical hardware deployment.


## Hardware Blueprints & Solutions

Explore how the ROS 2 runtime drives end-to-end hardware solutions and reference applications:

::::{grid} 2

:::{grid-item-card} **Autonomous Mobile Robot (AMR)**
:link: ../../hardware_blueprints/amr/index
:link-type: doc
:link-alt: clickable cards

Deploy ROS 2 Jazzy navigation, RTAB-Map SLAM, and sensor pipelines on mobile robot platforms.
:::

:::{grid-item-card} **Stationary Arm**
:link: ../../hardware_blueprints/stationary_arm/index
:link-type: doc
:link-alt: clickable cards

Implement vision-guided pick-and-place workflows with MoveIt 2 Servo and Universal Robots manipulators.
:::

:::{grid-item-card} **Humanoid Robot**
:link: ../../hardware_blueprints/humanoid/index
:link-type: doc
:link-alt: clickable cards

Run Agentic ROS frameworks, model predictive control (MPC), and high-frequency LiDAR odometry.
:::

:::{grid-item-card} **RealSense Camera with ROS 2**
:link: ../sensors/reference_applications/realsense-ros2
:link-type: doc
:link-alt: clickable cards

Stream color, depth, and point cloud data from RealSense cameras to ROS 2 topics and RViz2.
:::

::::
