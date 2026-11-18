# LiDAR and Visual Odometry Pipelines (LIO & LIVO)

Accurate and low-latency state estimation is the foundation of dynamic and autonomous navigation. In demanding environments—such as uneven industrial floors, stairs, ramps, outdoor construction zones, or long featureless corridors—traditional wheel odometry and planar 2D scan matchers often suffer from severe drift, slippage, and degradation.

The Robotics AI Suite integrates high-performance **LiDAR-Inertial Odometry (LIO)** and **LiDAR-Inertial-Visual Odometry (LIVO)** pipelines to deliver real-time, 6-DoF pose estimation and high-density 3D mapping on Intel platforms.

For detailed deployment tutorials and pipeline source code, refer to [LIO SLAM: FAST-LIO2](../../software_references/humanoid/sample_pipelines/fast_lio2_demo.md), [LIVO SLAM: FAST-LIVO2](../../software_references/humanoid/sample_pipelines/fast_livo2_demo.md), and [LIO SLAM: Point-LIO](../../software_references/humanoid/sample_pipelines/point_lio_demo.md).


## Architecture Overview

```{mermaid}
flowchart TD
    subgraph Sensors["Hardware Sensors"]
        LiDAR["LiDAR Scanner\n(Livox Mid-360 / Ouster / Velodyne)"]
        IMU["6-Axis / 9-Axis IMU\n(High-Rate Accelerometer & Gyroscope)"]
        Cam["RGB-D / Monocular Camera\n(RealSense D415 / D435i)"]
    end

    subgraph Odometry_Engines["LIO / LIVO State Estimation Engines"]
        direction TB
        FAST_LIO["FAST-LIO2\n(ikd-Tree + Iterated ESIKF)"]
        FAST_LIVO["FAST-LIVO2\n(Direct Photometric + Geometric ESIKF)"]
        POINT_LIO["Point-LIO\n(Point-by-Point High-Bandwidth ESIKF)"]
    end

    subgraph State_Outputs["State Estimation & Mapping Feeds"]
        OdomMsg["Odometry Message\n(/odom : nav_msgs/Odometry)"]
        TF["Coordinate Transforms\n(TF: odom -> base_link)"]
        CloudReg["Registered Point Cloud\n(/cloud_registered : PointCloud2)"]
    end

    subgraph Nav2_Stack["ROS 2 Navigation (Nav2)"]
        Costmap["Costmap 2D (Voxel / Obstacle Layer)"]
        Controller["Nav2 Controller Server (DWB / MPPI)"]
        Planner["Nav2 Planner Server / ITS Planner"]
    end

    LiDAR --> FAST_LIO
    IMU --> FAST_LIO

    LiDAR --> FAST_LIVO
    IMU --> FAST_LIVO
    Cam --> FAST_LIVO

    LiDAR --> POINT_LIO
    IMU --> POINT_LIO

    Odometry_Engines --> OdomMsg
    Odometry_Engines --> TF
    Odometry_Engines --> CloudReg

    OdomMsg --> Nav2_Stack
    TF --> Nav2_Stack
    CloudReg --> Costmap
    Costmap --> Controller
    Costmap --> Planner
```


## Supported Odometry Pipelines

The Robotics AI Suite integrates three complementary odometry engines ported to ROS 2 (validated on Jazzy and Humble):

### 1. FAST-LIO2 (LiDAR-Inertial Odometry)

[FAST-LIO2](../../software_references/humanoid/sample_pipelines/fast_lio2_demo.md) is a computationally efficient, robust LiDAR-inertial odometry framework. It pairs an iterated error-state Kalman filter (ESIKF) with an incremental kd-tree data structure (**ikd-Tree**).

- **Direct Point Cloud Registration**: Operates directly on raw point clouds without extracting hand-crafted geometric features (edges or planes), eliminating feature computation bottlenecks and supporting irregular scan patterns (such as Livox non-repetitive scanning).
- **Dynamic ikd-Tree**: Supports dynamic point insertion, point deletion, and box tree rebalancing in real time, dramatically reducing map query latency.
- **High Update Frequency**: Delivers odometry updates at the LiDAR scan rate (10–50 Hz) while consuming minimal CPU overhead.

### 2. FAST-LIVO2 (LiDAR-Inertial-Visual Odometry)

[FAST-LIVO2](../../software_references/humanoid/sample_pipelines/fast_livo2_demo.md) extends FAST-LIO2 by tightly coupling direct visual-inertial odometry (VIO) with LiDAR-inertial odometry (LIO).

- **Direct Image Alignment**: Tracks camera motion by directly minimizing photometric pixel errors across image patches without extracting ORB, SIFT, or SuperPoint descriptors.
- **Multimodal Complementarity**: In geometrically degenerate environments (e.g. long, smooth tunnels or symmetrical corridors where LiDAR points lack unique surface normals), visual tracking constrains the state estimate. Conversely, in low-light or textureless scenes, LiDAR geometry stabilizes motion tracking.
- **Sensor Setup**: Tested with a Livox Mid-360 LiDAR and a RealSense D415/D435i camera streaming into a unified state estimation graph.

### 3. Point-LIO (Point-by-Point Odometry)

[Point-LIO](../../software_references/humanoid/sample_pipelines/point_lio_demo.md) processes LiDAR points individually or in small sub-scan packets as they arrive from the sensor, rather than waiting for an entire frame accumulation.

- **Extreme Motion Bandwidth**: Designed for highly agile robotic platforms—such as bipedal humanoids and quadrupedal robots—experiencing aggressive rotations, shocks, and high-frequency vibrations.
- **Sub-Millisecond State Updates**: Provides immediate odometry updates with near-zero latency, enabling high-rate predictive stabilization for balance controllers.


## Integration with ROS 2 Nav2

LIO and LIVO pipelines integrate seamlessly into the Nav2 navigation stack:

### Coordinate Transformations (`tf2`)

The odometry pipeline broadcasts the continuous, smooth spatial transformation from the odometric world frame to the robot base:

- **Transform**: `odom` $\rightarrow$ `base_link`
- **Topic**: `/odom` (`nav_msgs/msg/Odometry`)

For global navigation, the map-level offset (`map` $\rightarrow$ `odom`) is provided by a global SLAM system (such as [Collaborative Visual SLAM](collaborative-slam.md)), a pre-built static map, or the [Robot Re-localization Package for ROS 2 Navigation](navigation-relocalization.md).

### Dynamic Costmap Feeding

The registered 3D point cloud (`/cloud_registered`) published by the LIO engine contains points transformed into the world frame with motion distortion removed. This feed can be directly mapped into the Nav2 `local_costmap` or `global_costmap` using standard voxel layers:

```yaml
local_costmap:
  local_costmap:
    ros__parameters:
      plugins: ["voxel_layer", "inflation_layer"]
      voxel_layer:
        plugin: "nav2_costmap_2d::VoxelLayer"
        enabled: true
        publish_voxel_map: true
        origin_z: -0.5
        z_resolution: 0.05
        z_voxels: 40
        max_obstacle_height: 2.0
        min_obstacle_height: -0.2
        observation_sources: lio_cloud
        lio_cloud:
          topic: /cloud_registered
          max_obstacle_height: 2.0
          min_obstacle_height: 0.05
          clearing: true
          marking: true
          data_type: "PointCloud2"
```


## Intel Hardware Optimization & Core Pinning

To prevent odometry estimation loops from stalling when the system executes heavy parallel workloads (such as OpenVINO™ neural network inference or Gazebo 3D simulation), the Robotics AI Suite utilizes thread isolation and CPU affinity on Intel hybrid architectures:

1. **LP-E / E-Core Pinning**: Pinning timing-critical LIO and VIO threads to dedicated Low-Power Efficient (LP-E) or Efficient (E) cores isolates state estimation from OS scheduler preemption:
   ```bash
   taskset -c 12,13 ros2 launch fast_livo2 mapping_mid360.launch.py
   ```
2. **DDS Shared-Memory Transport**: High-throughput LiDAR point clouds (e.g. 200,000 points/sec) leverage Cyclone DDS or Fast DDS zero-copy shared memory (`iceoryx`) to eliminate inter-process socket serialization bottlenecks.


## Comparison Matrix

| Pipeline | Modalities | Algorithmic Core | Ideal Robot Form Factors | Best Suited Environments |
| --- | --- | --- | --- | --- |
| **FAST-LIO2** | LiDAR + IMU | Iterated ESIKF + ikd-Tree | AMRs, Forklifts, Quadrupeds | Warehouses, industrial plants, open outdoor spaces |
| **FAST-LIVO2** | LiDAR + IMU + Camera | Direct photometric + geometric ESIKF | Humanoids, AMRs, Inspection robots | Tunnels, long corridors, complex indoor/outdoor facilities |
| **Point-LIO** | LiDAR + IMU | Point-by-point ESIKF | Dynamic humanoids, quadrupeds, agile drones | High-vibration, shock, and extreme angular velocity scenarios |


## Related Documentation

- [ROS 2 Nav2 Core Integration](nav2-integration.md): Core navigation stack architecture and server configuration.
- [Dynamic Obstacle Avoidance and Costmap Layers](dynamic-obstacle-avoidance.md): Dynamic clustering with ADBScan and 3D voxel representation.
- [Robot Re-localization Package for ROS 2 Navigation](navigation-relocalization.md): Rapid pose recovery in Nav2.
- [LIO SLAM: FAST-LIO2 Reference](../../software_references/humanoid/sample_pipelines/fast_lio2_demo.md): Colcon build and dataset replay instructions.
- [LIVO SLAM: FAST-LIVO2 Reference](../../software_references/humanoid/sample_pipelines/fast_livo2_demo.md): Colcon build, patch suite, and NTU VIRAL validation.
- [LIO SLAM: Point-LIO Reference](../../software_references/humanoid/sample_pipelines/point_lio_demo.md): Step-by-step setup and benchmarking.
