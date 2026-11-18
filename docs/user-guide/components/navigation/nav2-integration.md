# ROS 2 Nav2 Core Integration

The Robot Operating System 2 (ROS 2) Navigation stack (Nav2) serves as the primary autonomous motion planning and execution framework in the Robotics AI Suite. Nav2 provides a modular, production-ready system that enables robots to navigate complex indoor and industrial environments safely and autonomously.

The Robotics AI Suite standardizes on Nav2 for **ROS 2 Jazzy Jalisco** and **ROS 2 Humble Hawksbill**, enhanced with Intel-optimized global planners, dynamic costmap layers, hardware-accelerated feature extractors, and automated re-localization.

For general runtime fundamentals, see [ROS 2 Runtime](../runtime/index.md). For end-to-end simulation and deployment examples, see [Simulated Robotics with Gazebo](../../software_references/amr/simulation/basic_sim.md) and [Autonomous Mobile Robot Software Solutions](../../software_references/amr/index.md).


## Architecture & Core Modules

Nav2 decouples high-level task logic from low-level trajectory generation using action servers, behavior trees, and lifecycle-managed nodes.

```{mermaid}
flowchart TD
    subgraph Client["Application & Task Layer"]
        Goal["Navigation Goal\n(PoseStamped / Action Client)"]
    end

    subgraph Nav2_Core["Nav2 Navigation Stack"]
        BT["Behavior Tree Navigator\n(bt_navigator)"]
        Lifecycle["Nav2 Lifecycle Manager\n(nav2_lifecycle_manager)"]

        subgraph Servers["Nav2 Functional Servers"]
            Planner["Planner Server\n(Navfn / Smac / ITS Planner)"]
            Controller["Controller Server\n(DWB / MPPI / FollowPath)"]
            Smoother["Smoother Server\n(Simple / Savitzky-Golay)"]
            Behaviors["Behavior Server\n(Spin / Backup / Wait / DriveOnHeading)"]
            Waypoints["Waypoint Follower\n(Task Executor)"]
        end

        subgraph Costmaps["Costmap 2D Servers"]
            GlobalCostmap["Global Costmap\n(Static + Obstacle + Inflation)"]
            LocalCostmap["Local Costmap\n(Voxel + ADBScan + Inflation)"]
        end
    end

    subgraph Perception_Localization["Perception & State Estimation"]
        Odom["Odometry / LIO / LIVO\n(/odom, TF odom -> base_link)"]
        Map["Map Server / SLAM\n(/map, TF map -> odom)"]
        Sensors["Sensor Streams\n(RealSense Depth, 2D/3D LiDAR)"]
    end

    subgraph Base["Hardware / Simulation"]
        CmdVel["Actuator Velocity\n(/cmd_vel)"]
    end

    Goal --> BT
    BT --> Planner
    BT --> Controller
    BT --> Smoother
    BT --> Behaviors
    BT --> Waypoints

    Planner <--> GlobalCostmap
    Controller <--> LocalCostmap

    Sensors --> GlobalCostmap
    Sensors --> LocalCostmap
    Odom --> Nav2_Core
    Map --> Nav2_Core

    Controller --> CmdVel
```

### Key Modules

- **Behavior Tree Navigator (`bt_navigator`)**: Coordinates navigation logic by executing behavior trees defined in XML. It evaluates mission status, triggers path generation, invokes trajectory tracking, and dispatches recovery behaviors upon failure.
- **Planner Server (`planner_server`)**: Computes feasible, collision-free global paths from the robot's current pose to the goal. While Nav2 includes standard planners such as Navfn and SmacPlanner, the suite provides the patented [ITS Path Planner ROS 2 Navigation Plugin](its-path-planner-plugin.md), which accelerates global path planning by 20–30x compared to standard $A^*$.
- **Controller Server (`controller_server`)**: Executes local trajectory generation and dynamic obstacle avoidance at rates typically between 10 Hz and 50 Hz. It supports algorithms like DWB (Dynamic Window Approach) and MPPI (Model Predictive Path Integral) to publish velocity commands on the `/cmd_vel` topic.
- **Costmap 2D (`global_costmap` and `local_costmap`)**: Maintains multi-layered representations of environmental occupancy and obstacle inflation. The global costmap covers the entire workspace for long-term route planning, while the local costmap monitors the robot's immediate vicinity for real-time collision avoidance.
- **Smoother Server (`smoother_server`)**: Post-processes global paths to eliminate sharp corners, respect kinematic turning radius constraints, and optimize travel time.
- **Behavior Server (`behavior_server`)**: Executes recovery behaviors such as spinning in place, backing up, or waiting when the robot encounters unexpected obstacles or plan invalidations.
- **Lifecycle Manager (`nav2_lifecycle_manager`)**: Deterministically controls the state transitions of all Nav2 nodes (`unconfigured` $\rightarrow$ `inactive` $\rightarrow$ `active`), ensuring sensors, costmaps, and planners are fully initialized before motion commands can be issued.


## Costmap Layer Pipeline

Nav2 uses a modular plugin architecture to construct costmaps by stacking individual layers:

1. **Static Layer (`nav2_costmap_2d::StaticLayer`)**: Ingests pre-built 2D occupancy grid maps published by the map server or SLAM pipelines (such as [Collaborative Visual SLAM](collaborative-slam.md) or RTAB-Map).
2. **Obstacle Layer / Voxel Layer (`nav2_costmap_2d::ObstacleLayer` / `VoxelLayer`)**: Incorporates real-time 2D planar LiDAR scans or 3D depth point clouds to detect dynamic objects within sensor range.
3. **ADBScan Layer (`nav2_adbscan_layer`)**: Clusters 3D point cloud measurements into bounding volumes to track moving pedestrians and dynamic clutter. For implementation details, see [Dynamic Obstacle Avoidance and Costmap Layers](dynamic-obstacle-avoidance.md).
4. **Traversability Layer**: Incorporates ground segmentation from [3D Pointcloud Groundfloor Segmentation for RealSense Camera and 3D LiDAR](../sensors/reference_applications/pointcloud-groundfloor-segmentation.md) to separate navigable ground planes from obstacles and steep drops.
5. **Inflation Layer (`nav2_costmap_2d::InflationLayer`)**: Expands obstacle boundaries according to the robot's footprint and safety padding using an exponential decay cost function:

$$
\text{cost}(d) = \text{LETHAL\_OBSTACLE} \cdot \exp\left(-\zeta \cdot (d - r_{\text{inscribed}})\right)
$$

where $d$ is distance to the nearest obstacle, $r_{\text{inscribed}}$ is the inscribed radius of the robot footprint, and $\zeta$ is the cost scaling factor.


## Configuring Nav2

Below is a representative Nav2 parameter configuration demonstrating the integration of standard lifecycle management, costmap layer stacking, and planner server definitions:

```yaml
bt_navigator:
  ros__parameters:
    use_sim_time: false
    global_frame: map
    robot_base_frame: base_link
    odom_topic: /odom
    bt_loop_duration: 10
    default_server_timeout: 20
    enable_groot_monitoring: true

planner_server:
  ros__parameters:
    expected_planner_frequency: 1.0
    use_sim_time: false
    planner_plugins: ["GridBased"]
    GridBased:
      plugin: "nav2_navfn_planner/NavfnPlanner"
      tolerance: 0.5
      use_astar: true
      allow_unknown: true

controller_server:
  ros__parameters:
    use_sim_time: false
    controller_frequency: 20.0
    min_x_velocity_threshold: 0.001
    min_y_velocity_threshold: 0.5
    min_theta_velocity_threshold: 0.001
    controller_plugins: ["FollowPath"]
    FollowPath:
      plugin: "dwb_core::DWBLocalPlanner"
      debug_trajectory_details: true
      min_vel_x: 0.0
      min_vel_y: 0.0
      max_vel_x: 0.55
      max_vel_y: 0.0
      max_vel_theta: 1.0
      min_speed_xy: 0.0
      max_speed_xy: 0.55
      min_speed_theta: 0.0
      acc_lim_x: 2.5
      acc_lim_y: 0.0
      acc_lim_theta: 3.2
      decel_lim_x: -2.5
      decel_lim_y: 0.0
      decel_lim_theta: -3.2

global_costmap:
  global_costmap:
    ros__parameters:
      update_frequency: 1.0
      publish_frequency: 1.0
      global_frame: map
      robot_base_frame: base_link
      use_sim_time: false
      robot_radius: 0.22
      resolution: 0.05
      track_unknown_space: true
      plugins: ["static_layer", "obstacle_layer", "inflation_layer"]
      static_layer:
        plugin: "nav2_costmap_2d::StaticLayer"
        map_subscribe_transient_local: true
      obstacle_layer:
        plugin: "nav2_costmap_2d::ObstacleLayer"
        enabled: true
        observation_sources: scan
        scan:
          topic: /scan
          max_obstacle_height: 2.0
          clearing: true
          marking: true
          data_type: "LaserScan"
      inflation_layer:
        plugin: "nav2_costmap_2d::InflationLayer"
        cost_scaling_factor: 3.0
        inflation_radius: 0.55

local_costmap:
  local_costmap:
    ros__parameters:
      update_frequency: 5.0
      publish_frequency: 2.0
      global_frame: odom
      robot_base_frame: base_link
      use_sim_time: false
      rolling_window: true
      width: 3
      height: 3
      resolution: 0.05
      robot_radius: 0.22
      plugins: ["voxel_layer", "inflation_layer"]
      voxel_layer:
        plugin: "nav2_costmap_2d::VoxelLayer"
        enabled: true
        publish_voxel_map: true
        origin_z: 0.0
        z_resolution: 0.05
        z_voxels: 16
        max_obstacle_height: 2.0
        mark_threshold: 0
        observation_sources: pointcloud
        pointcloud:
          topic: /camera/depth/color/points
          max_obstacle_height: 2.0
          min_obstacle_height: 0.05
          clearing: true
          marking: true
          data_type: "PointCloud2"
      inflation_layer:
        plugin: "nav2_costmap_2d::InflationLayer"
        cost_scaling_factor: 3.0
        inflation_radius: 0.55
```


## Behavior Trees in Nav2

Nav2 relies on BehaviorTree.CPP to structure navigation workflows. A standard navigation behavior tree cycles through checking the goal, computing a path, smoothing the path, and following the path, with fallback branches to execute recoveries when deviations occur:

```xml
<root main_tree_to_execute="MainTree">
  <BehaviorTree ID="MainTree">
    <RecoveryNode number_of_retries="6" name="NavigateRecovery">
      <PipelineSequence name="NavigateWithReplanning">
        <RateController hz="1.0">
          <RecoveryNode number_of_retries="1" name="ComputePathToPoseRecovery">
            <ComputePathToPose goal="{goal}" path="{path}" planner_id="GridBased"/>
            <ClearEntireCostmap name="ClearGlobalCostmap-Context" server_timeout="5000" service_name="global_costmap/clear_entirely_global_costmap"/>
          </RecoveryNode>
        </RateController>
        <RecoveryNode number_of_retries="1" name="FollowPathRecovery">
          <FollowPath path="{path}" controller_id="FollowPath"/>
          <ClearEntireCostmap name="ClearLocalCostmap-Context" server_timeout="5000" service_name="local_costmap/clear_entirely_local_costmap"/>
        </RecoveryNode>
      </PipelineSequence>
      <ReactiveFallback name="RecoveryFallback">
        <GoalUpdated/>
        <RoundRobin name="RecoveryActions">
          <Spin spin_dist="1.57"/>
          <Wait wait_duration="5"/>
          <BackUp backup_dist="0.15" backup_speed="0.05"/>
        </RoundRobin>
      </ReactiveFallback>
    </RecoveryNode>
  </BehaviorTree>
</root>
```


## Launching and Verification

### Bringing Up Nav2 in Simulation

Launch Nav2 bringup alongside a simulated differential-drive robot in Gazebo:

::::{tab-set}
:::{tab-item} **Jazzy**
:sync: jazzy

```bash
source /opt/ros/jazzy/setup.bash
export TURTLEBOT3_MODEL=waffle
ros2 launch nav2_bringup tb3_simulation_launch.py headless:=false
```

:::
:::{tab-item} **Humble**
:sync: humble

```bash
source /opt/ros/humble/setup.bash
export TURTLEBOT3_MODEL=waffle
ros2 launch nav2_bringup tb3_simulation_launch.py headless:=false
```

:::
::::

### Setting an Initial Pose and Dispatching Goals

1. In RViz2, select **2D Pose Estimate** on the top toolbar. Click and drag on the map at the robot's simulated position to establish the initial transformation between `/map` and `/odom`.
2. Select **Nav2 Goal** (or **Navigation2 Goal**), click on an unoccupied target location, and orient the direction arrow.
3. The BT Navigator initiates path generation through the planner server and streams `/cmd_vel` motor commands through the controller server until the destination is reached.


## Related Navigation Solutions

- [ITS Path Planner ROS 2 Navigation Plugin](its-path-planner-plugin.md): Patented global planner providing 20–30x speedups over $A^*$.
- [Robot Re-localization Package for ROS 2 Navigation](navigation-relocalization.md): Rapid recovery of robot pose following sensor dropouts and kidnappings.
- [Dynamic Obstacle Avoidance and Costmap Layers](dynamic-obstacle-avoidance.md): Dynamic clustering with ADBScan and 3D voxel costmaps.
- [LiDAR and Visual Odometry Pipelines](lio-livo-pipelines.md): High-rate direct odometry using FAST-LIO2, FAST-LIVO2, and Point-LIO.
