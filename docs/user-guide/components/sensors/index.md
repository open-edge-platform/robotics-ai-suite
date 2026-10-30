# Sensors

Sensors provide your robotics solution with real-world perception, powering smart and autonomous systems. This documentation covers the camera and LiDAR integration used by
Robotics AI Suite applications.


::::{grid} 2

:::{grid-item-card} **GMSL Cameras**
:link: cameras/gmsl/index
:link-type: doc
:link-alt: clickable cards

Connect and stream uncompressed video and volumetric depth for computer vision and manipulation.
:::

:::{grid-item-card} **USB Cameras**
:link: cameras/usb/index
:link-type: doc
:link-alt: clickable cards

Configure and use without requiring specialized software to provide vision for perception use cases.
:::

:::{grid-item-card} **LiDAR**
:link: lidar
:link-type: doc
:link-alt: clickable cards

Bring up 3D point clouds for mapping and obstacle avoidance.
:::
::::


## Software Solutions

Use these applications to validate RealSense cameras and process 3D point cloud data from RealSense cameras or LiDAR sensors.


::::{grid} 2

:::{grid-item-card} **RealSense Camera with ROS 2**
:link: reference_applications/realsense-ros2
:link-type: doc
:link-alt: clickable cards

Validate camera streaming and integration with ROS 2 for robotics vision workloads.
:::

:::{grid-item-card} **3D Pointcloud Groundfloor Segmentation**
:link: reference_applications/pointcloud-groundfloor-segmentation
:link-type: doc
:link-alt: clickable cards

Process 3D point cloud data to segment ground surfaces and detect traversable regions.
:::
::::



:::{toctree}
:hidden:

Verified Supported Edge Cameras <https://builders.intel.com/solutionslibrary/verified-supported-edge-camera>
GMSL Camera Guide <cameras/gmsl/index>
USB Camera Guide <cameras/usb/index>
LiDAR <lidar>
Software Tutorials <reference_applications/index>
:::
