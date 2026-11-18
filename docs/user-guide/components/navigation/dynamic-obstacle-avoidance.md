# Dynamic Obstacle Avoidance and Costmap Layers

In dynamic industrial, warehouse, and service environments, mobile robots must handle unpredictably moving obstacles such as human workers, forklifts, and transient clutter. Conventional 2D costmaps based on static planar laser scans frequently struggle with 3D overhangs, negative obstacles, and noisy point clouds.

The Robotics AI Suite addresses dynamic obstacle avoidance by combining high-speed spatial clustering algorithms, 3D volumetric voxel mapping, and adaptive costmap plugins integrated directly into the Nav2 costmap pipeline.

For practical application examples, see [ADBSCAN Follow-me](adbscan-follow-me.md), [FastMapping Algorithm](run-fastmapping-algorithm.md), and [3D Pointcloud Groundfloor Segmentation for RealSense Camera and 3D LiDAR](../sensors/reference_applications/pointcloud-groundfloor-segmentation.md).


## Architecture Overview

```{mermaid}
flowchart TD
    subgraph Sensors["Perception Sensors"]
        RS["RealSense Depth Camera\n(/camera/depth/color/points)"]
        LiDAR["2D / 3D LiDAR Scanner\n(/scan or /lidar_points)"]
    end

    subgraph Processing["Intel Optimized Perception Algorithms"]
        GF["3D Groundfloor Segmentation\n(Plane Fitting & Normal Filtering)"]
        FM["FastMapping Algorithm\n(OctoMap 3D Voxel Engine)"]
        ADB["Adaptive DBSCAN (ADBScan)\n(Spatial Density Clustering)"]
    end

    subgraph Nav2_Costmap["Nav2 Layered Costmap Engine"]
        StaticL["Static Layer\n(Global Map)"]
        TraversableL["Traversability / Voxel Layer\n(Elevated Obstacles)"]
        ADBScanL["ADBScan Costmap Layer\n(Dynamic Obstacle Bounds)"]
        InflationL["Inflation Layer\n(Safety Footprint)"]
    end

    subgraph Motion["Motion Planning & Control"]
        Controller["Nav2 Controller Server\n(DWB / MPPI Dynamic Tracking)"]
        CmdVel["Actuator Velocity\n(/cmd_vel)"]
    end

    RS --> GF
    RS --> FM
    RS --> ADB
    LiDAR --> ADB

    GF --> TraversableL
    FM --> TraversableL
    ADB --> ADBScanL
    StaticL --> InflationL
    TraversableL --> InflationL
    ADBScanL --> InflationL

    InflationL --> Controller
    Controller --> CmdVel
```


## ADBScan: Adaptive Spatial Clustering

Density-Based Spatial Clustering of Applications with Noise (DBSCAN) is an unsupervised clustering algorithm that groups points closely packed together while marking points in low-density regions as outliers. Standard DBSCAN requires fixed distance parameters ($\epsilon$), which leads to poor performance on LiDAR and depth camera point clouds where point density decreases quadratically with distance.

Intel's **Adaptive DBSCAN (ADBScan)** algorithm dynamically scales the neighborhood radius $\epsilon$ as a function of the range from the sensor:

$$
\epsilon(r) = \epsilon_0 + k_{\epsilon} \cdot r
$$

where $r = \sqrt{x^2 + y^2 + z^2}$ is the Euclidean distance from the sensor origin, $\epsilon_0$ is the base search radius, and $k_{\epsilon}$ is a distance-dependent expansion coefficient.

### Key Capabilities

- **High-Throughput Execution**: Capable of clustering over 50,000 points per frame at rates exceeding 30 Hz on Intel® Core™ Ultra and Intel Atom® processors.
- **Dynamic Cluster Tracking**: Tracks moving centroids, velocities, and 3D oriented bounding boxes of moving obstacles across consecutive frames.
- **Costmap Plugin (`nav2_adbscan_layer`)**: Emits clustered obstacle arrays directly to a custom Nav2 costmap layer (`nav2_adbscan_layer::ADBScanLayer`), updating lethal and circumscribed costs dynamically without waiting for standard voxel decay timeouts.


## FastMapping: 3D Volumetric Voxel Representation

While 2D occupancy grids are computationally lightweight, they cannot represent multi-level structures, overhanging tables, low clearance pipes, or cantilevered racking.

The **FastMapping** component provides an Intel-optimized OctoMap implementation designed for real-time 3D voxel mapping:

- **Probabilistic Occupancy Updating**: Maintains 3D voxel cells using log-odds probability formulation, mitigating sensor noise and measurement uncertainty.
- **Dynamic 2D Projection**: Projects active 3D voxel volumes into 2D Nav2 obstacle layers on the fly, allowing 2D global and local planners to safely route under elevated obstacles while stopping for hanging obstructions.
- **Hardware Acceleration**: Optimized with AVX2 and Level-Zero compute kernels for low-latency voxel raycasting on integrated Intel GPUs (iGPUs).


## 3D Groundfloor Segmentation & Traversability

For ground-based AMRs and humanoid robots operating over ramps, uneven ground, and outdoor pavement, naive height filtering classifies sloped terrain as obstacles.

The **3D Pointcloud Groundfloor Segmentation** package addresses this:

1. **Surface Normal Estimation**: Computes point surface normals to differentiate vertical obstacle walls from planar floors and inclined ramps.
2. **Convex Hull Ground Extraction**: Fits planar equations to identify drivable ground, separating positive obstacles (boxes, walls, humans) from negative obstacles (stairs, drop-offs).
3. **Traversability Scoring**: Publishes labeled traversability point clouds that feed into Nav2 costmaps with terrain roughness penalties.


## Configuring the Dynamic Costmap Stack

To use the ADBScan layer and volumetric point clouds in the Nav2 local costmap, configure the plugin chain in your Nav2 parameters:

```yaml
local_costmap:
  local_costmap:
    ros__parameters:
      update_frequency: 10.0
      publish_frequency: 5.0
      global_frame: odom
      robot_base_frame: base_link
      use_sim_time: false
      rolling_window: true
      width: 4
      height: 4
      resolution: 0.05
      robot_radius: 0.25
      plugins: ["voxel_layer", "adbscan_layer", "inflation_layer"]

      voxel_layer:
        plugin: "nav2_costmap_2d::VoxelLayer"
        enabled: true
        publish_voxel_map: true
        origin_z: 0.0
        z_resolution: 0.05
        z_voxels: 16
        max_obstacle_height: 2.0
        mark_threshold: 0
        observation_sources: depth_camera
        depth_camera:
          topic: /camera/depth/color/points
          max_obstacle_height: 2.0
          min_obstacle_height: 0.08
          clearing: true
          marking: true
          data_type: "PointCloud2"

      adbscan_layer:
        plugin: "nav2_adbscan_layer::ADBScanLayer"
        enabled: true
        cluster_topic: "/obstacle_array"
        footprint_clearing_enabled: true
        combination_method: 1
        observation_persistence: 0.2

      inflation_layer:
        plugin: "nav2_costmap_2d::InflationLayer"
        cost_scaling_factor: 2.5
        inflation_radius: 0.60
```


## Tuning Controller Server for Dynamic Obstacles

To avoid oscillations when navigating around dynamic obstacles, configure the controller server with appropriate forward simulation lookaheads and collision penalties:

- **MPPI Controller (`nav2_mppi_controller::MPPIController`)**: Uses GPU/CPU vectorized trajectory rollouts to evaluate hundreds of prospective trajectories in real time, smoothly maneuvering around moving targets.
- **DWB Local Planner (`dwb_core::DWBLocalPlanner`)**: For differential drive platforms, tune `Oscillation.oscillation_reset_dist` and `PathAlign.scale` to avoid abrupt stops when dynamic obstacle layers clear or shift.


## Related Documentation

- [ROS 2 Nav2 Core Integration](nav2-integration.md): Core Nav2 server configurations, lifecycle, and behavior trees.
- [ADBSCAN Follow-me](adbscan-follow-me.md): Person following and dynamic cluster detection tutorial.
- [FastMapping Algorithm](run-fastmapping-algorithm.md): 3D voxel map generation from RealSense depth cameras.
- [3D Pointcloud Groundfloor Segmentation for RealSense Camera and 3D LiDAR](../sensors/reference_applications/pointcloud-groundfloor-segmentation.md): Classifying point clouds into ground surfaces and obstacles.
- [Simulating `wandering` in Gazebo](../../software_references/amr/simulation/wandering_sim.md): Full autonomous exploration pipeline with ADBScan costmap integration.
