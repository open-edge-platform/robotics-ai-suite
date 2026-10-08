# PyTorch* on Intel GPU (XPU)

PyTorch* includes upstreamed support for Intel graphics processing units (GPUs) via the `xpu` device backend. This integration enables out-of-the-box hardware acceleration across Intel® Core™ Ultra processors with integrated Intel® Arc™ graphics, discrete Intel® Arc™ GPUs, and Intel® Data Center GPU Flex Series. This implementation replaces legacy PyTorch-specific tools like IPEX by providing a unified frontend for quick development and inference on Intel hardware.

You can find more information at [PyTorch XPU Documentation](https://docs.pytorch.org/docs/stable/notes/get_start_xpu.html).

## Architecture Overview

The following diagram illustrates how PyTorch XPU connects application-layer robotics workflows with Intel compute hardware:

```{mermaid}
flowchart TD
    subgraph Apps["Robotics Application Layer"]
        R1["ROS 2 Nodes"]
        R2["Hugging Face & LeRobot"]
        R3["Custom Policy Prototyping"]
    end

    subgraph PyTorch["PyTorch Framework"]
        F1["PyTorch Python API / torch.nn"]
        F2["Autograd & Eager Execution"]
        F3["Device Target: torch.device('xpu')"]
    end

    subgraph Acceleration["Intel® Acceleration & Runtime"]
        A1["ATen XPU Operators & Kernels"]
        A2["Intel® oneAPI Deep Neural Network Library (oneDNN)"]
        A3["Intel® Compute Runtime (Level Zero / OpenCL)"]
    end

    subgraph Hardware["Intel® Compute Hardware"]
        H1["Intel® Core™ Ultra Processors (Intel® Arc™ graphics)"]
        H2["Intel® Arc™ Discrete GPUs"]
        H3["Intel® Data Center GPU Flex Series"]
    end

    Apps --> PyTorch
    PyTorch --> Acceleration
    Acceleration --> Hardware
```

## Accelerating Quick Iteration in Robotics Development

In robotics workflows, development cycles demand rapid iteration between algorithm adjustments, sensor data collection, and perception or policy validation. Upstreamed PyTorch XPU support accelerates this development cycle:

- **Frictionless Prototyping:** Developers can write standard PyTorch code using `device = torch.device("xpu")` or `.to("xpu")`. Community models, Hugging Face pipelines, and PyTorch-based robotics frameworks run directly on Intel hardware with minimal or no code modification.
- **Immediate Inner-Loop Feedback:** Training, fine-tuning, and evaluating models—such as imitation learning policies (e.g., Action Chunking with Transformers, Diffusion Policy), vision-language-action (VLA) models, and real-time vision pipelines—can execute directly on the robot's onboard compute or edge developer kit. This eliminates the friction of ahead-of-time model conversion while iterating on designs.
- **Native Debugging and Dynamic Shapes:** Native execution on XPU supports eager mode, dynamic tensor shapes, interactive Python debugging, and PyTorch autograd inspection. Roboticists can troubleshoot unexpected sensor inputs and edge cases interactively within ROS 2 nodes without graph compilation hurdles.
- **Seamless Transition to Optimized Deployment:** Once a perception or control model is validated using PyTorch on XPU, developers can either run it directly in production via PyTorch or export it to [OpenVINO™](../openvino/index.md) for ultra-low latency, optimized runtime execution across heterogeneous hardware.

## Installation and Target Versions

The Robotics AI Suite targets the latest stable release of PyTorch with XPU support by default:

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/xpu
```

Where specific robotics pipelines or models require different release channels (such as preview/nightly wheels or pinned versions), those requirements are specified directly at the application level.

Before installing PyTorch with XPU support, ensure that the appropriate Intel GPU compute drivers are configured on your host system as outlined in [Get Started](../../platform_foundation/getting_started.md).

:::{note}
**Kernel and Operator Support Considerations:**
While standard ATen operators and widespread deep learning primitives are implemented natively for the `xpu` backend, certain specialized or newly introduced operators, non-standard quantization schemes, or custom CUDA C++ extensions from third-party libraries may not yet have direct XPU kernel parity. If an unsupported operator is encountered during eager execution, PyTorch may raise a `NotImplementedError` for the XPU device. In such cases:

- Offload the unsupported sub-operation or fallback layer to CPU using `.to("cpu")` before returning tensors to `xpu`.
- Verify if a nightly or preview PyTorch XPU wheel implements the newly upstreamed kernel.
- For inference workloads, export the model to [OpenVINO™](../openvino/index.md), which provides comprehensive operator coverage and optimized kernel implementations across Intel GPUs and accelerators.
:::

## Robotics Pipelines and Workflows

Several robotics sample pipelines and workflows in the Robotics AI Suite use or integrate with PyTorch and can leverage PyTorch XPU during development and iteration:

- [Imitation Learning (ACT)](../../software_references/humanoid/sample_pipelines/imitation_learning_act.md): Train Action Chunking with Transformers policies directly in PyTorch before deployment.
- [Diffusion Policy](../../software_references/humanoid/sample_pipelines/diffusion_policy.md): Train and simulate visuomotor diffusion policies with native GPU acceleration.
- [Robotics Diffusion Transformer (RDT)](../../software_references/humanoid/sample_pipelines/robotics_diffusion_transformer.md): Prototype and fine-tune diffusion transformer architectures for bimanual manipulation.
- [Pi0.5 with Real-Time Control (RTC)](../../software_references/humanoid/sample_pipelines/pi05_with_rtc.md): Develop and inspect vision-language-action (VLA) foundation models prior to export.
- [LLM Robotics](../../software_references/humanoid/sample_pipelines/llm_robotics.md): Experiment with multimodal language and audio reasoning models within robotic task pipelines.
- [Physical AI Studio & LeRobot Workflows](../../resources/hackathon_resources.md): Train and evaluate imitation learning policies using Hugging Face LeRobot accelerated with PyTorch XPU.
- [OpenVINO™ Model Guidance](../openvino/models/index.md): Transition validated PyTorch perception and control models to optimized OpenVINO™ Intermediate Representation (IR) for edge deployment.

## Transitioning to Production Deployment with OpenVINO™

While PyTorch XPU provides an agile inner loop for rapid prototyping, interactive debugging, and model training, production robotics systems typically operate under tight latency deadlines, power budgets, and compute constraints.

Once your policy, perception pipeline, or foundation model is verified in PyTorch, transition it to [Intel® OpenVINO™](../openvino/index.md) for production deployment:

- **Model Optimization and Compression:** Apply graph-level operator fusions and post-training quantization (such as 8-bit or 4-bit weight compression via Neural Network Compression Framework) to minimize latency and memory bandwidth consumption.
- **Heterogeneous Hardware Scheduling:** Target onboard Intel® Core™ Ultra CPUs, integrated Intel® Arc™ graphics, discrete Intel® Arc™ GPUs, or low-power NPUs using a unified inference engine and dynamic workload scheduling.
- **Robotics Runtime Integration:** Deploy optimized OpenVINO™ Intermediate Representation (IR) models into production ROS 2 nodes, standalone C++ or Python execution pipelines, or through the [OpenVINO™ Physical AI](https://github.com/openvinotoolkit/physicalai) for deterministic sensor-to-action loops.

Refer to the [OpenVINO™ Model Guidance](../openvino/models/index.md) for step-by-step conversion instructions for models commonly used across the Robotics AI Suite.

## Resources

- [PyTorch Getting Started with XPU](https://pytorch.org/docs/stable/notes/get_start_xpu.html)
- [PyTorch XPU Device Documentation](https://pytorch.org/docs/stable/xpu.html)
- [Intel® OpenVINO™](../openvino/index.md)
