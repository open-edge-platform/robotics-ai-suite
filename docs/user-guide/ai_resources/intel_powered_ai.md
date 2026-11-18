# AI Developer Tools and Frameworks

Here you will find guidance that covers the frameworks, models, and tools used to build and
optimize robot perception and intelligence workloads.

## Developer Tools

Use these tools to develop, optimize, and profile AI workloads for Robotics AI
Suite applications. Install versions supported by the relevant application or
Blueprint; do not combine independently pinned toolkit versions without
validating the resulting environment.

| Tool | Use |
| --- | --- |
| [PyTorch XPU](developer_tools/pytorch-xpu.md) | Accelerate model prototyping, training, and rapid iteration on Intel GPUs. |
| [OpenVINO™](https://docs.openvino.ai/) | Optimize and deploy deep-learning inference workloads. |
| [Intel oneAPI Toolkits](https://www.intel.com/content/www/us/en/developer/tools/oneapi/overview.html) | Develop and profile heterogeneous C++, SYCL, and data-parallel workloads. |
| [OpenVINO™ Physical AI](https://github.com/openvinotoolkit/physicalai) | Accelerate your OpenVINO™-powered deployment with a unified API for connecting cameras, robots, and policy inference. |
| [Intel Physical AI Studio](https://github.com/open-edge-platform/physical-ai-studio)| Train and deploy VLA models with an easy-to-use imitation learning dataset generation platform. |
| [Geti](https://github.com/open-edge-platform/geti) | Use an end-to-end pipeline to create vision AI models optimized for Intel. |

For performance analysis, see [Benchmarking and Profiling](../components/benchmarking/index.md).


::::{grid} 2

:::{grid-item-card} **OpenVINO™**
:link: openvino/index
:link-type: doc
:link-alt: clickable cards

Optimize and deploy deep-learning inference on available Intel compute devices.
:::

:::{grid-item-card} **PyTorch XPU**
:link: developer_tools/pytorch-xpu
:link-type: doc
:link-alt: clickable cards

Accelerate model prototyping, training, and fine-tuning on Intel GPUs.
:::

:::{grid-item-card} **Physical AI Studio**
:link: physical_ai_studio
:link-type: doc
:link-alt: clickable cards

Capture teleoperation datasets, train imitation-learning policies, and evaluate embodied AI workflows.
:::

:::{grid-item-card} **Geti™**
:link: developer_tools/geti
:link-type: doc
:link-alt: clickable cards

Use an end-to-end pipeline to label data and create vision AI models optimized for Intel.
:::

:::{grid-item-card} **Intel® oneAPI**
:link: developer_tools/oneapi
:link-type: doc
:link-alt: clickable cards

Develop and accelerate heterogeneous C++, SYCL, and data-parallel compute workloads.
:::

:::{grid-item-card} **AI Skills**
:link: skills/index
:link-type: doc
:link-alt: clickable cards

Find skills for use with the Robotics AI Suite to power AI-enabled development.
:::
::::
