# Sensors & Perception

Sensors and accelerated perception libraries provide your robotics solution with real-world spatial awareness, powering mapping, navigation, and manipulation. This documentation covers camera and LiDAR bring-up alongside hardware-accelerated point cloud and feature-extraction components.


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


## Perception & Point Cloud Solutions

Use these applications and Intel-accelerated libraries to validate RealSense cameras, process 3D point clouds, and extract visual features on Intel CPUs and GPUs.


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

:::{grid-item-card} **PCL oneAPI Component**
:link: ../optimized_solutions/libpcl-oneapi
:link-type: doc
:link-alt: clickable cards

Accelerate point cloud filtering, features, segmentation, and registration on Intel GPUs.
:::

:::{grid-item-card} **FLANN oneAPI Component**
:link: ../optimized_solutions/libflann-oneapi
:link-type: doc
:link-alt: clickable cards

Accelerate 3D KD-Tree nearest-neighbor and radius spatial indexing with Intel oneAPI and SYCL.
:::

:::{grid-item-card} **GPU ORB Extractor**
:link: ../optimized_solutions/orb-extractor
:link-type: doc
:link-alt: clickable cards

Extract Visual SLAM keypoints and descriptors with Intel GPU acceleration.
:::
::::



:::{toctree}
:hidden:

Verified Supported Edge Cameras <https://builders.intel.com/solutionslibrary/verified-supported-edge-camera>
GMSL Camera Guide <cameras/gmsl/index>
USB Camera Guide <cameras/usb/index>
LiDAR <lidar>
Perception & Point Cloud <reference_applications/index>
:::
