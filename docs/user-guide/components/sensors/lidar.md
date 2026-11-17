<!--hide_directive
```{eval-rst}
.. meta::
   :description: Validated LiDAR sensors for the Robotics AI Suite, with ROS 2 driver installation, sensor placement, and frame transform guidance.
   :keywords: LiDAR, Velodyne VLP-16, RPLIDAR, SICK nanoScan3 Pro, ROS 2, point cloud, laser scan, navigation
```
hide_directive-->

# LiDAR

LiDAR sensors provide high-precision 2D planar scans and 3D point cloud perception for
autonomous mobile robots (AMRs), navigation, and obstacle avoidance.

## Validated Hardware

The following LiDAR sensors have been validated for use with the Robotics AI Suite:

| Sensor                         | Type                   | Interface           | Output Topic(s)                                    | ROS 2 Driver Package |
| ------------------------------ | ---------------------- | ------------------- | -------------------------------------------------- | -------------------- |
| **Velodyne Puck (VLP-16)**     | 3D LiDAR (16-channel)  | Ethernet (UDP)      | `/velodyne_points` (`sensor_msgs/msg/PointCloud2`) | [`velodyne`](https://github.com/ros-drivers/velodyne)                     |
| **RoboPeak / Slamtec RPLIDAR** | 2D LiDAR (360° Planar) | USB (Serial UART)   | `/scan` (`sensor_msgs/msg/LaserScan`)              | [`sllidar_ros2`](https://github.com/Slamtec/sllidar_ros2) / `rplidar_ros` |
| **SICK nanoScan3 Pro**         | 2D Safety LiDAR        | Ethernet (COAP/UDP) | `/scan` (`sensor_msgs/msg/LaserScan`)              | [`sick_safetyscanners2`](https://github.com/SICKAG/sick_safetyscanners2)  |

---

## Integration Overview

LiDAR integration is robot and driver dependent. Complete driver setup and verify sensor data
before integrating with navigation or perception stacks.

### 1. Driver Installation and Bringup

Install and configure the ROS 2 driver corresponding to your sensor interface:

<!--hide_directive ::::{tab-set} hide_directive-->
<!--hide_directive :::{tab-item} hide_directive--> **Velodyne Puck (VLP-16)**
<!--hide_directive :sync: velodyne hide_directive-->

The Velodyne Puck connects over Ethernet and streams raw UDP packets that are unpacked into
3D point clouds.

- **Driver:** [`velodyne`](https://github.com/ros-drivers/velodyne)
- **Install (binary):**
  ```bash
  sudo apt install ros-${ROS_DISTRO}-velodyne
  ```
- **Launch:**
  ```bash
  ros2 launch velodyne velodyne-all-nodes-VLP16-launch.py
  ```
- **Default Output:** `/velodyne_points` (`sensor_msgs/msg/PointCloud2`)

<!--hide_directive ::: hide_directive-->
<!--hide_directive :::{tab-item} hide_directive--> **RoboPeak / Slamtec RPLIDAR**
<!--hide_directive :sync: rplidar hide_directive-->

RoboPeak/Slamtec 2D scanners connect over USB serial (typically `/dev/ttyUSB0`) to publish
360-degree planar scan profiles.

- **Driver:** [`sllidar_ros2`](https://github.com/Slamtec/sllidar_ros2)
  (or `ros-${ROS_DISTRO}-rplidar-ros`)
- **Install (binary):**
  ```bash
  sudo apt install ros-${ROS_DISTRO}-rplidar-ros
  ```
  *(Or clone and build `sllidar_ros2` from source for newer A/S-series models.)*
- **Launch:**
  ```bash
  ros2 launch sllidar_ros2 sllidar_launch.py
  ```
- **Default Output:** `/scan` (`sensor_msgs/msg/LaserScan`)

<!--hide_directive ::: hide_directive-->
<!--hide_directive :::{tab-item} hide_directive--> **SICK nanoScan3 Pro**
<!--hide_directive :sync: sick hide_directive-->

The SICK nanoScan3 Pro is an industrial safety LiDAR communicating over Ethernet via the SICK
safety scanner protocol.

- **Driver:** [`sick_safetyscanners2`](https://github.com/SICKAG/sick_safetyscanners2)
- **Install (binary):**
  ```bash
  sudo apt install ros-${ROS_DISTRO}-sick-safetyscanners2
  ```
- **Launch:**
  ```bash
  ros2 launch sick_safetyscanners2 sick_safetyscanners2_launch.py sensor_ip:=<SENSOR_IP>
  ```
- **Default Output:** `/scan` (`sensor_msgs/msg/LaserScan`)

<!--hide_directive ::: hide_directive-->
<!--hide_directive :::: hide_directive-->

### 2. Sensor Placement and Frame Transforms (TF)

Confirm that static transforms for your LiDAR optical/mounting frames (for example, `laser`
or `velodyne`) are broadcast relative to `base_link`:

- Review the relevant [Hardware Blueprint](../../hardware_blueprints/index.md) (such as the
  [Clearpath Jackal AMR](../../hardware_blueprints/amr/clearpath-jackal.md)) for mounting
  geometries and transform definitions.
- Verify published frames and data rates:
  ```bash
  ros2 topic hz /scan
  ros2 run tf2_tools view_frames
  ```

---

## Applications and Pipelines

Once verified, LiDAR streams feed directly into Robotics AI Suite perception and navigation
components:

- **[LiDAR and Visual Odometry Pipelines (LIO and LIVO)](../navigation/lio-livo-pipelines.md):**
  6-degrees-of-freedom (6-DoF) state estimation and Simultaneous Localization and Mapping
  (SLAM) using 3D LiDAR point clouds (FAST-LIO2, Point-LIO).
- **[3D Pointcloud Groundfloor Segmentation](reference_applications/pointcloud-groundfloor-segmentation.md):**
  Segment ground planes, ramps, and obstacle point clouds for traversability analysis.
- **[Nav2 Integration](../navigation/nav2-integration.md):** Feed 2D `/scan` and 3D voxel
  layers into standard costmaps and planners.
