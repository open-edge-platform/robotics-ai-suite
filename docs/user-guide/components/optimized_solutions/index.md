# Robotics Components optimized for Intel

Prerequisite: Complete the [Getting Started](../../platform_foundation/getting_started.md) guide.

## Autonomous Mobile Robot

With step-by-step instructions covering real world usage scenarios,
these tutorials provide a learning path for developers to use and configure the Autonomous Mobile Robot.


::::{grid} 2

:::{grid-item-card} **Collaborative Visual SLAM**
:link: collaborative-slam
:link-type: doc
:link-alt: clickable cards

Build, merge, and optimize maps across one or more mobile robots.
:::

:::{grid-item-card} **FastMapping**
:link: run-fastmapping-algorithm
:link-type: doc
:link-alt: clickable cards

Create a 3D voxel map from RealSense depth-camera data.
:::

:::{grid-item-card} **ADBSCAN Follow-me**
:link: adbscan-follow-me
:link-type: doc
:link-alt: clickable cards

Detect and follow a person using LiDAR or RealSense point clouds.
:::

:::{grid-item-card} **ITS Path Planner**
:link: ../navigation/its-path-planner-plugin
:link-type: doc
:link-alt: clickable cards

Configure the ITS global planner for ROS 2 Navigation.
:::

:::{grid-item-card} **Robot Re-localization**
:link: ../navigation/navigation-relocalization
:link-type: doc
:link-alt: clickable cards

Restore the robot pose after localization loss in a navigation workflow.
:::

:::{grid-item-card} **GPU ORB Extractor**
:link: orb-extractor
:link-type: doc
:link-alt: clickable cards

Extract visual-SLAM keypoints and descriptors with GPU acceleration.
:::

:::{grid-item-card} **FLANN oneAPI Component**
:link: libflann-oneapi
:link-type: doc
:link-alt: clickable cards

Accelerate 3D KD-Tree nearest neighbor and radius spatial indexing with Intel oneAPI and SYCL.
:::

:::{grid-item-card} **PCL oneAPI Component**
:link: libpcl-oneapi
:link-type: doc
:link-alt: clickable cards

Accelerate point cloud filtering, features, segmentation, and registration on Intel GPUs.
:::
::::

## Solutions and Ingredients

The table below lists the software solutions, sample pipelines, and tutorials
available across this documentation. The **Domains** column categorizes each
entry to help you find relevant material for your application.

| Reference | Domains | Description |
| --- | --- | --- |
| [RealSense Camera with ROS 2 Sample Application](../sensors/reference_applications/realsense-ros2.md) | Sensors, Middleware | Integrates a RealSense camera with ROS 2 to stream color and depth data, launch camera nodes, and visualize the feed in RViz2. |
| [3D Pointcloud Groundfloor Segmentation for RealSense Camera and 3D LiDAR](../sensors/reference_applications/pointcloud-groundfloor-segmentation.md) | Sensors, AI | Intel algorithm that classifies 3D point clouds from RealSense or LiDAR sensors into ground, elevated surfaces, and obstacles for navigation over challenging terrain. |
| [Multi-Camera Object Detection Powered by OpenVINO™](../../ai_resources/openvino/reference_applications/openvino_multicam_demo.md) | AI, OpenVINO™, Sensors | Runs OpenVINO™-optimized YOLOv8 object detection and segmentation in parallel across up to four USB or GMSL cameras. |
| [OpenVINO™ Object Detection Tutorial](../../ai_resources/openvino/reference_applications/object_detection_tutorial.md) | AI, OpenVINO™, Sensors, Middleware | Deploys a ROS 2 OpenVINO™ node for object detection with selectable CPU, GPU, or NPU inference devices. |
| [OpenVINO™ Yolov8 Tutorial](../../ai_resources/openvino/reference_applications/yolov8_openvino_tutorial.md) | AI, OpenVINO™, Sensors, Middleware | Installs a ROS 2 OpenVINO™ node and runs a YOLOv8 segmentation model on the CPU using a RealSense camera image as input. |
| [OpenVINO™ Tutorial with Segmentation](../../ai_resources/openvino/reference_applications/segmentation_realsense_tutorial.md) | AI, OpenVINO™, Sensors, Middleware | Runs a ROS 2 OpenVINO™ semantic segmentation model on CPU or GPU using a RealSense camera image as input. |
| [Collaborative Visual SLAM](collaborative-slam.md) | Autonomous Mobile Robot, SLAM | Multi-robot visual SLAM optimized with SSE/AVX2 instruction sets for map building and merging on Intel CPUs and GPUs. |
| [FastMapping Algorithm](run-fastmapping-algorithm.md) | Autonomous Mobile Robot, Sensors | Intel-optimized octomap implementation that builds 3D voxel maps from RealSense depth camera data for efficient environment representation. |
| [ADBSCAN Follow-me](adbscan-follow-me.md) | Autonomous Mobile Robot, AI, Sensors | Adaptive DBSCAN person detection and tracking from 2D/3D LiDAR or RealSense point clouds, with Gazebo simulation and real-robot deployment examples. |
| [ITS Path Planner ROS 2 Navigation Plugin](../navigation/its-path-planner-plugin.md) | Autonomous Mobile Robot, Navigation | Intel patented global path planner delivering 20-30x speedup over A* for the ROS 2 Navigation2 stack. |
| [Robot Re-localization Package for ROS 2 Navigation](../navigation/navigation-relocalization.md) | Autonomous Mobile Robot, Navigation | Re-localization algorithm that rapidly recovers robot pose in Nav2 after sensor glitches or environment disturbances. |
| [GPU ORB Extractor](orb-extractor.md) | Autonomous Mobile Robot, SLAM | GPU-accelerated keypoint and descriptor extraction for Visual SLAM front-ends, with OpenCV and OpenCV-free APIs. |
| [FLANN oneAPI Component](libflann-oneapi.md) | Autonomous Mobile Robot, Sensors, Spatial Indexing | Native Intel oneAPI and SYCL 2020 accelerated 3D KD-Tree search and zero-copy USM resident radius queries. |
| [PCL oneAPI Component](libpcl-oneapi.md) | Autonomous Mobile Robot, Sensors, Point Cloud | Hardware-accelerated point cloud processing for filters, features, segmentation, and SAC model fitting. |
| [Deploy Robot Teleop Using a Keyboard](../../software_references/amr/deployment/teleop_deploy.md) | Autonomous Mobile Robot | Validates motor control on a deployed robot using keyboard teleoperation before running autonomous workloads. |
| [Deploying `wandering`](../../software_references/amr/deployment/wandering_deploy.md) | Autonomous Mobile Robot, Navigation | Deploys the Wandering autonomous exploration pipeline on a physical robot using RTAB-Map and Nav2. |
| [Simulated Robotics with Gazebo](../../software_references/amr/simulation/basic_sim.md) | Autonomous Mobile Robot, Simulation | Introduces simulating robots as digital twins in Gazebo to test robotics applications before real-world deployment. |
| [Simulating `wandering` in Gazebo](../../software_references/amr/simulation/wandering_sim.md) | Autonomous Mobile Robot, Simulation, Navigation | Simulates the full Wandering pipeline in Gazebo with mapping, frontier exploration, and Nav2-based navigation. |
| [Gazebo Pick & Place Demo](../../software_references/stationary_arm/simulation/picknplace.md) | Middleware, Manipulation, Simulation | Coordinates two UR5 arms and a TurtleBot3 AMR on a conveyor line using MoveIt2 and Nav2 in Gazebo Classic. |
| [Imitation Learning - ACT](../../software_references/humanoid/sample_pipelines/imitation_learning_act.md) | Humanoid, AI, OpenVINO™, Manipulation | Imitation learning pipeline using Action Chunking with Transformers, optimized with OpenVINO™, for fine manipulation in simulation and on real ALOHA robots. |
| [Model Predictive Control Demo](../../software_references/humanoid/sample_pipelines/mpc_demo.md) | Humanoid, AI, Manipulation | Combines ACT imitation learning with OCS2 model predictive control and MuJoCo simulation for perception-action manipulation control. |
| [Diffusion Policy](../../software_references/humanoid/sample_pipelines/diffusion_policy.md) | Humanoid, AI, OpenVINO™, Manipulation | Visuomotor diffusion-policy pipeline for the Push-T manipulation task, with Transformer- and CNN-based variants optimized by OpenVINO™. |
| [VSLAM: ORB-SLAM3](../../software_references/humanoid/sample_pipelines/ORB_VSLAM.md) | Humanoid, SLAM | Real-time feature-based Visual SLAM supporting monocular, stereo, and RGB-D cameras, with EUROC dataset and RealSense demos. |
| [LLM Robotics Demo](../../software_references/humanoid/sample_pipelines/llm_robotics.md) | Humanoid, AI, Manipulation | Code-generation pipeline combining an LLM (Phi-4), vision models (SAM, CLIP), and a JAKA arm for voice- or text-commanded robot control. |
| [Robotics Diffusion Transformer (RDT)](../../software_references/humanoid/sample_pipelines/robotics_diffusion_transformer.md) | Humanoid, AI, OpenVINO™, Manipulation | Bimanual manipulation foundation model with a unified action space, running in MuJoCo simulation and on real ALOHA robots with OpenVINO™ optimization. |
| [Pi0.5 with Real-Time Chunking](../../software_references/humanoid/sample_pipelines/pi05_with_rtc.md) | Humanoid, AI, OpenVINO™, Manipulation | Vision-Language-Action pipeline pairing a PaliGemma VLM with a flow-matching policy and real-time chunking for smooth high-frequency control, accelerated with OpenVINO™. |
| [Action Chunking with Transformers - ACT](../../ai_resources/openvino/models/model_act.md) | AI, OpenVINO™, Manipulation | Imitation learning model that predicts action chunks with Transformers for fine manipulation, including conversion to OpenVINO™ IR. |
| [Diffusion Policy (Model)](../../ai_resources/openvino/models/model_dp.md) | AI, OpenVINO™, Manipulation | Visuomotor policy using conditional denoising diffusion to handle multimodal action distributions, with low-dim and image variants and OpenVINO™ conversion. |
| [Robotics Diffusion Transformer (RDT-1B)](../../ai_resources/openvino/models/model_rdt.md) | AI, OpenVINO™, Manipulation | 1.2B-parameter diffusion foundation model for manipulation pre-trained on 46 datasets, with OpenVINO™ IR conversion guidance. |
| [General-purpose robot foundation model (Pi0)](../../ai_resources/openvino/models/model_pi0.md) | AI, OpenVINO™, Manipulation | Vision-Language-Action foundation model pairing a PaliGemma VLM with an action-expert diffusion transformer, including OpenVINO™ conversion. |
| [BC-RNN & BC-Transformer](../../ai_resources/openvino/models/model_bc_rnn.md) | AI, OpenVINO™, Manipulation | Behavior cloning models using RNN or Transformer backbones to map observations to actions from expert demonstrations. |
| [Visual Servoing - CNS](../../ai_resources/openvino/models/model_cns.md) | AI, OpenVINO™, Manipulation | Graph neural network image-based visual servo policy achieving sub-millimeter precision at real-time (~40 fps) rates. |
| [GraspNet - Baseline](../../ai_resources/openvino/models/model_graspnet.md) | AI, OpenVINO™, Manipulation | Grasp generation model trained on GraspNet-1Billion that predicts scored 6-DoF grasp poses from point clouds. |
| [Feature Extraction Model: SuperPoint](../../ai_resources/openvino/models/model_superpoint.md) | AI, OpenVINO™, SLAM | Self-supervised interest point detector and descriptor generator with homographic adaptation for cross-domain generalization. |
| [Feature Tracking Model: LightGlue](../../ai_resources/openvino/models/model_lightglue.md) | AI, OpenVINO™, SLAM | Lightweight transformer feature matcher with adaptive depth and width for efficient correspondence in 3D reconstruction and localization. |
| [Improved 3D Diffusion Policy (iDP3)](../../ai_resources/openvino/models/model_idp3.md) | AI, OpenVINO™, Manipulation | Enhanced 3D manipulation policy that encodes point clouds with a 3D visual encoder and generates actions via diffusion. |
| [Bird's Eye View Perception: Fast-BEV](../../ai_resources/openvino/models/model_fastbev.md) | AI, OpenVINO™, Navigation | Efficient multi-scale bird's-eye-view perception model for obstacle avoidance, path planning, and spatial awareness. |
| [Monocular Depth Estimation: Depth Anything V2](../../ai_resources/openvino/models/model_depthanythingv2.md) | AI, OpenVINO™, Sensors | Monocular depth estimation foundation model (25M-1.3B parameters) for cost-effective depth perception without LiDAR. |
| [Wandering AMR Pipeline Benchmark](../benchmarking/robotics-system-profiler/wandering-benchmark.md) | Benchmarking, Autonomous Mobile Robot | Automated benchmarking of the Wandering AMR pipeline, measuring latency, resource usage, and optional GPU/NPU KPIs across runs. |
| [Pick & Place Pipeline Benchmark](../benchmarking/robotics-system-profiler/picknplace-benchmark.md) | Benchmarking, Manipulation | Automated benchmarking of the multi-robot Pick & Place simulation, capturing lifecycle metrics and aggregated KPIs. |


:::{toctree}
:maxdepth: 1
:hidden:

collaborative-slam
run-fastmapping-algorithm
adbscan-follow-me
orb-extractor
libflann-oneapi
libpcl-oneapi

:::


