# Manipulation

The Robotics AI Suite integrates **MoveIt 2** and **MoveIt 2 Servo** on top of
ROS 2 for motion planning and real-time Cartesian control of multi-axis robotic
arms, alongside OpenVINO™-accelerated imitation learning and vision-language-action
(VLA) policies. These capabilities power vision-guided pick-and-place and bimanual
task execution on both simulated and physical hardware.

## Manipulation Reference Workflows

::::{grid} 2

:::{grid-item-card} **Stationary Arm Reference Software**
:link: ../../software_references/stationary_arm/index
:link-type: doc
:link-alt: clickable cards

Vision-guided pick-and-place workflows built on ROS 2 and MoveIt 2 Servo, in Gazebo simulation and UR5e physical deployment.
:::

:::{grid-item-card} **Gazebo Pick & Place Demo**
:link: ../../software_references/stationary_arm/simulation/picknplace
:link-type: doc
:link-alt: clickable cards

Coordinate two UR5 arms and a mobile robot on a conveyor line using MoveIt 2 and Nav2.
:::

:::{grid-item-card} **Imitation Learning (ACT)**
:link: ../../software_references/humanoid/sample_pipelines/imitation_learning_act
:link-type: doc
:link-alt: clickable cards

Fine bimanual manipulation using Action Chunking with Transformers optimized with OpenVINO™.
:::

:::{grid-item-card} **Diffusion Policy**
:link: ../../software_references/humanoid/sample_pipelines/diffusion_policy
:link-type: doc
:link-alt: clickable cards

Visuomotor diffusion-policy pipeline for contact-rich manipulation tasks with OpenVINO™ acceleration.
:::

:::{grid-item-card} **Robotics Diffusion Transformer (RDT)**
:link: ../../software_references/humanoid/sample_pipelines/robotics_diffusion_transformer
:link-type: doc
:link-alt: clickable cards

Bimanual manipulation foundation model running in MuJoCo simulation and on ALOHA robots.
:::

:::{grid-item-card} **Model Predictive Control (OCS2 + MuJoCo)**
:link: ../../software_references/humanoid/sample_pipelines/mpc_demo
:link-type: doc
:link-alt: clickable cards

Combine ACT imitation learning with OCS2 model predictive control in MuJoCo simulation.
:::
::::
