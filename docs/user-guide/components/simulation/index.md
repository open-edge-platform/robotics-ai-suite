# Simulation

Simulation serves as the digital proving ground for the Robotics AI Suite. By accurately modeling kinematics, multi-body rigid physics, environmental collisions, and synthetic sensor streams, simulation allows developers to develop, benchmark, and validate complex autonomous systems in a risk-free virtual environment before deploying to physical hardware.

The suite standardizes on **Gazebo Harmonic** as its primary 3D robotics simulation platform for **ROS 2 Jazzy** on **Canonical Ubuntu 24.04 LTS**, while also integrating **MuJoCo** for high-frequency Embodied AI and manipulation dynamics.


## Supported Simulation Frameworks

::::{grid} 2

:::{grid-item-card} **Gazebo (Gazebo Harmonic / Gazebo Sim)**
The standard 3D simulation platform for the Robotics AI Suite. Provides realistic rigid-body dynamics (DART physics engine), sensor plugins (RGB-D depth cameras, LiDAR, IMU), material properties, and rich 3D warehouse and industrial work cell environments.
:::

:::{grid-item-card} **ROS 2 - Gazebo Bridge (`ros_gz`)**
Bidirectional communication bridge connecting Gazebo transport with the ROS 2 message bus. Transparently translates sensor streams, clock signals, joint states, and actuator commands between the simulator and ROS 2 nodes.
:::

:::{grid-item-card} **MuJoCo Physics Engine**
High-performance contact-dynamics simulator utilized for Embodied AI, Humanoid robot control, and imitation learning workflows such as Model Predictive Control (OCS2/MPC), Action Chunking with Transformers (ACT), and Diffusion Policies.
:::

:::{grid-item-card} **Mock Hardware Mode**
Physics-free execution mode available in driver and control packages (such as Universal Robots and MoveIt 2 Servo). Allows instantaneous testing of state machines, communication logic, and trajectory generation without physics or rendering overhead.
:::

::::


## Architecture & Core Concepts

```{mermaid}
flowchart TD
    subgraph Simulation_Engine["Simulation Engine (Gazebo / MuJoCo)"]
        Physics["Rigid Body & Contact Physics\n(DART / ODE / MuJoCo)"]
        World["World Models & Environments\n(Warehouse, Worktable, Obstacles)"]
        Sensors["Sensor Plugins\n(RealSense RGB-D, 2D/3D LiDAR, IMU)"]
        Clock["Simulation Clock\n(/clock)"]
    end

    subgraph Bridge["Communication Bridge"]
        RosGz["ROS-Gazebo Bridge (ros_gz)\nMuJoCo ROS Bindings"]
    end

    subgraph ROS2_Stack["ROS 2 Application Stack (Jazzy)"]
        Perception["Perception & OpenVINO™\n(Object Detection, SLAM, Point Clouds)"]
        Navigation["Navigation & Planning\n(Nav2, ITS Planner, FastMapping)"]
        Manipulation["Manipulation & Control\n(MoveIt 2, MoveIt 2 Servo, MPC)"]
        Viz["Visualization & Monitoring\n(RViz2, Foxglove)"]
    end

    Physics --> Sensors
    Clock --> RosGz
    Sensors --> RosGz
    RosGz --> Perception
    RosGz --> Navigation
    Navigation --> RosGz
    Manipulation --> RosGz
    ROS2_Stack --> Viz
```

### Simulation Time Synchronization (`/clock`)

In simulation, wall-clock time differs from virtual physics time. Gazebo publishes simulation time on the `/clock` topic.

All ROS 2 nodes in the application stack must run with simulation time enabled:

```bash
ros2 launch <package_name> <launch_file>.py use_sim_time:=true
```

When `use_sim_time:=true` is configured:
- Message timestamps, TF2 coordinate transforms, and trajectory interpolation align with physics simulation steps.
- ROS 2 performance profiling tools (such as `ros-kpi` and the Robotics System Profiler) evaluate latency and throughput against simulation clock timestamps rather than host wall-clock time.

### Headless vs. Graphical Execution

Robotics AI Suite simulation packages support decoupling backend physics execution from graphical rendering:

- **Headless Mode (`gui:=false`)**: Runs only the simulation server (`gz-server` / `gz sim -s`). This minimizes CPU and GPU usage, making it ideal for automated CI/CD testing, headless edge servers, and high-throughput benchmarking.
- **Interactive Graphical Mode (`gui:=true`)**: Launches the Gazebo 3D rendering client alongside RViz2, enabling real-time visual inspection of robot behavior, collision bounding boxes, and camera perspectives.

### Synthetic Sensor Streams

Simulated robots in the suite publish synthetic sensor feeds matching real hardware interfaces:
- **RealSense Depth Cameras**: Color video (`/camera/color/image_raw`), depth images (`/camera/depth/image_rect_raw`), camera intrinsics, and aligned 3D point clouds (`/camera/depth/color/points`).
- **2D/3D LiDAR**: Planar scans (`sensor_msgs/LaserScan`) and full volumetric point clouds (`sensor_msgs/PointCloud2`) for mapping and obstacle detection.
- **Odometry and Joint Feedback**: Wheel encoders (`nav_msgs/Odometry`) and manipulator joint positions (`sensor_msgs/JointState`).


## Installing Gazebo Harmonic

If you installed the Robotics AI Suite using the [Express Setup](../../platform_foundation/getting_started/express.md) or [Image Composer Tool](../../platform_foundation/getting_started/image_composer_tool.md), Gazebo Harmonic and simulation bridges are pre-installed.

For manual installation on Canonical Ubuntu 24.04 LTS:

```bash
sudo apt-get update
sudo apt-get install -y curl lsb-release gnupg

# Add the official Open Source Robotics Foundation (OSRF) repository
sudo -E curl https://packages.osrfoundation.org/gazebo.gpg --output /usr/share/keyrings/pkgs-osrf-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/pkgs-osrf-archive-keyring.gpg] https://packages.osrfoundation.org/gazebo/ubuntu-stable $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/gazebo-stable.list > /dev/null

# Install Gazebo Harmonic and the ROS 2 Jazzy bridge
sudo apt-get update
sudo apt-get install -y gz-harmonic ros-jazzy-ros-gz
```

Verify your Gazebo installation:

```bash
gz sim --version
```


## Simulation Tutorials

The Robotics AI Suite provides pre-built simulation workflows across mobile robots, industrial manipulators, and humanoid platforms:

::::{grid} 2

:::{grid-item-card} **Simulated Robotics with Gazebo**
:link: ../../software_references/amr/simulation/basic_sim
:link-type: doc
:link-alt: clickable cards

Introduction to simulating mobile robots and material-handling cells in Gazebo Classic and Gazebo Harmonic.
:::

:::{grid-item-card} **Wandering Autonomous Navigation**
:link: ../../software_references/amr/simulation/wandering_sim
:link-type: doc
:link-alt: clickable cards

Simulate a full autonomous exploration pipeline with TurtleBot3 Waffle RGB-D, RTAB-Map SLAM, and Nav2 in Gazebo.
:::

:::{grid-item-card} **Stationary Arm Vision & Control (RVC)**
:link: ../../software_references/stationary_arm/simulation/rvc_sim
:link-type: doc
:link-alt: clickable cards

Simulate a Universal Robots UR5e arm, Robotiq gripper, and RealSense camera with MoveIt 2 Servo in Gazebo.
:::

:::{grid-item-card} **Gazebo Pick & Place Demo**
:link: ../../software_references/stationary_arm/simulation/picknplace
:link-type: doc
:link-alt: clickable cards

Coordinate two UR5 arms and a mobile robot on a conveyor line with MoveIt 2 and Nav2.
:::

:::{grid-item-card} **Model Predictive Control (MuJoCo)**
:link: ../../software_references/humanoid/sample_pipelines/mpc_demo
:link-type: doc
:link-alt: clickable cards

Simulate dual-arm manipulation and ACT imitation learning with OCS2 MPC in the MuJoCo physics engine.
:::

:::{grid-item-card} **ADBSCAN Follow-me Simulation**
:link: ../navigation/adbscan-follow-me
:link-type: doc
:link-alt: clickable cards

Validate adaptive DBSCAN person detection and target tracking using simulated LiDAR and depth data.
:::

::::
