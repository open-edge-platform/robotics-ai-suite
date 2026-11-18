import { queryOptions } from "@tanstack/react-query";

export type SkillSource = "toolkit" | "intel";

export type Skill = {
  id: string;
  name: string;
  summary: string;
  description: string;
  hwClass?: string;
  products?: string[];
  labels: string[];
  installCommand: string;
  sourceUrl: string;
  source?: SkillSource;
  pinned?: boolean;
  pinnedBadge?: string;
};

export type PinnedSkillConfig =
  | string
  | {
      id: string;
      badge?: string;
    };

/**
 * Statically pinned skills showcased at the top of /skills/.
 * Entries can be a skill `id` string or `{ id, badge }` for a custom callout
 * (defaults to "Pinned"). Works for both TOOLKIT_SKILLS and Intel skills.
 * Array order controls display order in the Pinned section.
 */
export const PINNED_SKILLS: PinnedSkillConfig[] = [
  { id: "wandering-sample", badge: "Featured" },
  { id: "xpu-deploy-plan", badge: "Featured" },
  "cuda-to-xpu-migration",
];

/**
 * Skills shipped directly with the Robotics AI Suite repository (.github/skills/).
 * These are highlighted in the catalog with a "Robotics AI Suite" badge and can be
 * filtered via the Source facet.
 */
export const TOOLKIT_SKILLS: Skill[] = [
  {
    id: "wandering-sample",
    name: "wandering-sample",
    summary:
      "Review-first workflow for changes in components/wandering and tutorial packages.",
    description:
      "Review-first workflow for changes in components/wandering and tutorial packages. Use when editing Wandering launch files, docs, tests, Nav2 wiring, RTAB-Map, RealSense, or robot bring-up paths.",
    products: ["Robotics AI Suite", "ROS 2", "Nav2"],
    labels: ["ROS 2", "Nav2", "AMR"],
    installCommand:
      "npx skills add open-edge-platform/robotics-ai-suite --skill wandering-sample",
    sourceUrl:
      "https://github.com/open-edge-platform/robotics-ai-suite/blob/main/.github/skills/wandering-sample/SKILL.md",
    source: "toolkit",
  },
];

export const FALLBACK_SKILLS: Skill[] = [
  {
    "id": "cuda-to-xpu-migration",
    "name": "cuda-to-xpu-migration",
    "summary": "Create a CUDA-to-XPU migration assessment for an existing AI repo.",
    "description": "Create a CUDA-to-XPU migration assessment for an existing AI repo. Identify CUDA-specific assumptions, route to the right XPU skills, produce a migration report. Use when the user has a CUDA repo, notebook, Dockerfile, launch script, HF / vLLM / SGLang workload, or Triton kernel and asks to migrate it to Intel Arc / Arc Pro / Battlemage / XPU — including \"convert this to XPU\" / \"move it to XPU\" and the bare \"migrate this repo\" request where scope is not yet set. A request that says \"port\" routes to xpu-port. Plans and routes only. Not for executing an already-scoped rewrite (use xpu-port), running migrated code, or measuring it.",
    "hwClass": "gpu",
    "products": [
      "Intel Arc",
      "Intel Arc Pro"
    ],
    "labels": [
      "GPU",
      "Intel Arc",
      "Intel Arc Pro"
    ],
    "installCommand": "npx skills add intel/skills --skill cuda-to-xpu-migration",
    "sourceUrl": "https://github.com/intel/gpu-ai-skills/tree/3fb51a0b69527fadcdec3e4ae6b84121d39115dc/plugins/intel-gpu-ai-skills/skills/cuda-to-xpu-migration"
  },
  {
    "id": "dpnp-interop",
    "name": "dpnp-interop",
    "summary": "Passing dpnp arrays to and from other Python libraries on Intel CPUs and GPUs.",
    "description": "Passing dpnp arrays to and from other Python libraries on Intel CPUs and GPUs. Use when dpnp numeric work has to feed pandas, scikit-learn, PyTorch, or TensorFlow, when one of those libraries raises a type error on a dpnp array, when a pipeline mixes device math with host-only libraries, or when the user asks where in a pipeline the conversion belongs. Covers the boundary conversion pattern per library, the Intel extensions that accelerate the host side, and why a conversion inside a loop erases the benefit.",
    "hwClass": "gpu",
    "products": [
      "dpnp"
    ],
    "labels": [
      "GPU",
      "dpnp"
    ],
    "installCommand": "npx skills add intel/skills --skill dpnp-interop",
    "sourceUrl": "https://github.com/intel/skills/tree/main/skills/dpnp-interop"
  },
  {
    "id": "dpnp-io",
    "name": "dpnp-io",
    "summary": "Reading and writing files from dpnp code on Intel CPUs and GPUs.",
    "description": "Reading and writing files from dpnp code on Intel CPUs and GPUs. Use when the user needs to load an array into dpnp or save a dpnp result — .npy, .npz, HDF5 via h5py, Zarr, CSV or plain text — when a file is larger than device memory and has to be read in chunks, or when they ask why dpnp has no save function of its own. Covers the NumPy conversion round trip, chunked and incremental patterns, and choosing a format by dataset size.",
    "hwClass": "gpu",
    "products": [
      "dpnp"
    ],
    "labels": [
      "GPU",
      "dpnp"
    ],
    "installCommand": "npx skills add intel/skills --skill dpnp-io",
    "sourceUrl": "https://github.com/intel/skills/tree/main/skills/dpnp-io"
  },
  {
    "id": "dpnp-linalg-fft",
    "name": "dpnp-linalg-fft",
    "summary": "Linear algebra and FFT with dpnp on Intel CPUs and GPUs, backed by oneMKL.",
    "description": "Linear algebra and FFT with dpnp on Intel CPUs and GPUs, backed by oneMKL. Use when a matrix multiply, solve, decomposition, eigenvalue problem, or Fourier transform is the hot part of NumPy code, when the user asks whether dpnp covers a linalg or FFT call, when an FFT result differs slightly from NumPy's, or when a large transform runs out of device memory. Covers the supported surface, transform sizing and plan reuse, fallbacks for what is missing, and how to check conditioning before solving.",
    "hwClass": "gpu",
    "products": [
      "dpnp",
      "oneMKL"
    ],
    "labels": [
      "GPU",
      "dpnp",
      "oneMKL"
    ],
    "installCommand": "npx skills add intel/skills --skill dpnp-linalg-fft",
    "sourceUrl": "https://github.com/intel/skills/tree/main/skills/dpnp-linalg-fft"
  },
  {
    "id": "dpnp-memory",
    "name": "dpnp-memory",
    "summary": "Device memory management for dpnp arrays on Intel CPUs and GPUs.",
    "description": "Device memory management for dpnp arrays on Intel CPUs and GPUs. Use when a dpnp script grows in memory until it fails, when a dataset does not fit in device memory, when an array turns out to be on a different device than expected, or when a loop allocates a new array on every iteration. Covers USM allocation, inspecting placement and queues with dpctl, reusing an output buffer, chunking a workload larger than the device, and the tools that report device memory use.",
    "hwClass": "gpu",
    "products": [
      "dpnp",
      "dpctl"
    ],
    "labels": [
      "GPU",
      "dpnp",
      "dpctl"
    ],
    "installCommand": "npx skills add intel/skills --skill dpnp-memory",
    "sourceUrl": "https://github.com/intel/skills/tree/main/skills/dpnp-memory"
  },
  {
    "id": "dpnp-migration",
    "name": "dpnp-migration",
    "summary": "Porting an existing NumPy or CuPy program to dpnp on Intel CPUs and GPUs.",
    "description": "Porting an existing NumPy or CuPy program to dpnp on Intel CPUs and GPUs. Use when deciding whether a codebase can run on dpnp at all, when a call raises NotImplementedError or AttributeError after the import was swapped, when the user asks whether dpnp supports a specific NumPy function or family, or when CuPy code has to move to Intel hardware. Covers probing the installed release for what it actually implements, the families that have no device counterpart, the fallback wrapper for the ones that do not, and where CuPy's device model differs from dpnp's.",
    "hwClass": "gpu",
    "products": [
      "dpnp"
    ],
    "labels": [
      "GPU",
      "dpnp"
    ],
    "installCommand": "npx skills add intel/skills --skill dpnp-migration",
    "sourceUrl": "https://github.com/intel/skills/tree/main/skills/dpnp-migration"
  },
  {
    "id": "dpnp-quickstart",
    "name": "dpnp-quickstart",
    "summary": "NumPy-compatible array operations optimized for Intel hardware.",
    "description": "NumPy-compatible array operations optimized for Intel hardware. Use when the user wants to migrate or port NumPy code to dpnp, asks whether a NumPy hot path can run on an Intel CPU or GPU, needs to check dpnp installation or SYCL device selection with dpctl, hits a NumPy API dpnp does not implement, or wants to compare dpnp against NumPy. Covers install, device control, fallback patterns, and profiling.",
    "hwClass": "gpu",
    "products": [
      "dpnp",
      "dpctl"
    ],
    "labels": [
      "GPU",
      "dpnp",
      "dpctl"
    ],
    "installCommand": "npx skills add intel/skills --skill dpnp-quickstart",
    "sourceUrl": "https://github.com/intel/skills/tree/main/skills/dpnp-quickstart"
  },
  {
    "id": "dpnp-random",
    "name": "dpnp-random",
    "summary": "Random number generation with dpnp on Intel CPUs and GPUs, backed by oneMKL.",
    "description": "Random number generation with dpnp on Intel CPUs and GPUs, backed by oneMKL. Use when NumPy random calls move to dpnp, when a seeded dpnp run does not reproduce a NumPy sequence, when a distribution turns out not to be implemented, when results have to be reproducible across machines, or when random data feeds a training or augmentation loop. Covers the supported distributions, what seeding does and does not guarantee, the host fallback, and where to generate data so it does not bounce between host and device.",
    "hwClass": "gpu",
    "products": [
      "dpnp",
      "oneMKL"
    ],
    "labels": [
      "GPU",
      "dpnp",
      "oneMKL"
    ],
    "installCommand": "npx skills add intel/skills --skill dpnp-random",
    "sourceUrl": "https://github.com/intel/skills/tree/main/skills/dpnp-random"
  },
  {
    "id": "dpnp-troubleshooting",
    "name": "dpnp-troubleshooting",
    "summary": "Diagnosing dpnp failures on Intel CPUs and GPUs.",
    "description": "Diagnosing dpnp failures on Intel CPUs and GPUs. Use when dpnp raises NotImplementedError or an unexpected TypeError, when the import fails or a SYCL runtime library is missing, when no SYCL device is visible, when dpctl reports a device the user did not expect, or when dpnp code runs slower than the NumPy it replaced. Covers the fallback pattern for unimplemented APIs, install repair, forcing CPU execution, and the handoff to libraries that only accept NumPy arrays.",
    "hwClass": "gpu",
    "products": [
      "dpnp",
      "dpctl"
    ],
    "labels": [
      "GPU",
      "dpnp",
      "dpctl"
    ],
    "installCommand": "npx skills add intel/skills --skill dpnp-troubleshooting",
    "sourceUrl": "https://github.com/intel/skills/tree/main/skills/dpnp-troubleshooting"
  },
  {
    "id": "linux-perf",
    "name": "linux-perf",
    "summary": "Profile and fix Linux performance problems using <code>perf</code>.",
    "description": "Profile and fix Linux performance problems using <code>perf</code>. Workflows: (A) hardware counters -- IPC, cache-miss, branch mispredictions; (B) hotspot profiling -- which functions and source lines consume CPU, with SIMD and accumulator detection; (C) cache-line contention -- false sharing, HITM, <code>perf c2c</code>; (D) core-count scaling -- dual-profile comparison, bottleneck categorization; (E) structured hotspot report with annotated source and pattern observations. Resolution strategies: TTAS spinlock, SIMD upconversion, parallel accumulator, structured false-sharing fix, per-CPU stats. Trigger on: perf, profiling, profile, hotspot, hotspots, cache miss, IPC, false sharing, HITM, scaling, core count, thread scaling, bottleneck, slow code, CPU bound, why is this slow, where does time go, does not scale. When in doubt, invoke this skill -- better to use it unnecessarily than to miss a performance opportunity.",
    "hwClass": "cpu",
    "products": [
      "linux-perf"
    ],
    "labels": [
      "CPU",
      "linux-perf"
    ],
    "installCommand": "npx skills add intel/skills --skill linux-perf",
    "sourceUrl": "https://github.com/intel/intel-performance-skills/tree/e9d0b6410fb1ad7a50fb81e0868fd23ae886882c/skills/linux-perf"
  },
  {
    "id": "llamacpp-xpu-run",
    "name": "llamacpp-xpu-run",
    "summary": "Run a GGUF model on an Intel GPU using llama.cpp's SYCL backend (Level Zero) with the official intel.Dockerfile.",
    "description": "Run a GGUF model on an Intel GPU using llama.cpp's SYCL backend (Level Zero) with the official intel.Dockerfile. Covers building the Docker image from source at a pinned tag, launching llama-server with an OpenAI-compatible API, device selection, multi-GPU layer splitting, all recommended runtime env vars, flash-attention, and quantisation selection. Use when the user has a GGUF model and wants fast local inference or an OpenAI-compatible endpoint on Intel GPU without Python/PyTorch. The CUDA analogue is llama.cpp built with <code>-DGGML_CUDA=ON</code>. Use <strong>vllm-xpu-run</strong> instead for safetensors models with continuous batching at scale; use <strong>torch-xpu-run</strong> for Hugging Face Transformers direct.",
    "hwClass": "gpu",
    "products": [
      "Intel GPU",
      "Level Zero"
    ],
    "labels": [
      "GPU",
      "Intel GPU",
      "Level Zero"
    ],
    "installCommand": "npx skills add intel/skills --skill llamacpp-xpu-run",
    "sourceUrl": "https://github.com/intel/gpu-ai-skills/tree/3fb51a0b69527fadcdec3e4ae6b84121d39115dc/plugins/intel-gpu-ai-skills/skills/llamacpp-xpu-run"
  },
  {
    "id": "mkl-extension-advisor",
    "name": "mkl-extension-advisor",
    "summary": "Deciding whether Intel's MKL extension packages apply to NumPy or SciPy code on Intel CPUs.",
    "description": "Deciding whether Intel's MKL extension packages apply to NumPy or SciPy code on Intel CPUs. Use when a user asks whether mkl_fft, mkl_random, or mkl_umath help their code, or points at a snippet, function, file, or codebase using np.fft, scipy.fft, np.random, or element-wise math ufuncs. Also use to check whether these extensions are already active in an environment, to fix an install so they and the SciPy FFT backend actually work, or to judge whether patching would change results and break exact-output tests. DO NOT use for GPU work, non-Intel CPUs, or mkl-service thread tuning.",
    "hwClass": "cpu",
    "products": [
      "mkl_fft",
      "mkl_random",
      "mkl_umath",
      "mkl-service"
    ],
    "labels": [
      "CPU",
      "mkl_fft",
      "mkl_random",
      "mkl_umath",
      "mkl-service"
    ],
    "installCommand": "npx skills add intel/skills --skill mkl-extension-advisor",
    "sourceUrl": "https://github.com/intel/skills/tree/main/skills/mkl-extension-advisor"
  },
  {
    "id": "model-can-it-fit",
    "name": "model-can-it-fit",
    "summary": "Estimate whether a Hugging Face decoder-only LLM, MoE, or VLM fits in Intel GPU VRAM for a quantization, context length, concurrency, runtime, and tensor-parallel setting.",
    "description": "Estimate whether a Hugging Face decoder-only LLM, MoE, or VLM fits in Intel GPU VRAM for a quantization, context length, concurrency, runtime, and tensor-parallel setting. Use for memory-fit or max-model-len planning before launch. Reports weights, KV cache, activations, framework overhead, and first mitigation. Not for diffusion. Memory-only — does NOT predict throughput, tokens/sec, latency, or runtime config; route those to bench/deploy/recommend skills.",
    "hwClass": "gpu",
    "products": [
      "Intel GPU"
    ],
    "labels": [
      "GPU",
      "Intel GPU"
    ],
    "installCommand": "npx skills add intel/skills --skill model-can-it-fit",
    "sourceUrl": "https://github.com/intel/gpu-ai-skills/tree/3fb51a0b69527fadcdec3e4ae6b84121d39115dc/plugins/intel-gpu-ai-skills/skills/model-can-it-fit"
  },
  {
    "id": "model-config-recommend",
    "name": "model-config-recommend",
    "summary": "Recommend a vLLM-XPU deployment config (quant, KV dtype, DP/TP, max concurrency, max context) for a Hugging Face decoder-only LLM on Intel Arc B-series GPUs using roofline math against published hardware specs.",
    "description": "Recommend a vLLM-XPU deployment config (quant, KV dtype, DP/TP, max concurrency, max context) for a Hugging Face decoder-only LLM on Intel Arc B-series GPUs using roofline math against published hardware specs. Experimental; predictions are physics-bounded ranges, not measured throughput. Use after xpu-discover and before vllm-xpu-run.",
    "hwClass": "gpu",
    "products": [
      "Intel Arc"
    ],
    "labels": [
      "GPU",
      "Intel Arc"
    ],
    "installCommand": "npx skills add intel/skills --skill model-config-recommend",
    "sourceUrl": "https://github.com/intel/gpu-ai-skills/tree/3fb51a0b69527fadcdec3e4ae6b84121d39115dc/plugins/intel-gpu-ai-skills/skills/model-config-recommend"
  },
  {
    "id": "onetbb-quickstart",
    "name": "onetbb-quickstart",
    "summary": "Getting started with Intel oneTBB for C++ parallelism on Intel CPUs.",
    "description": "Getting started with Intel oneTBB for C++ parallelism on Intel CPUs. Use when a C++ loop or reduction should run on multiple threads with oneTBB, when the user needs the headers, namespace, or CMake wiring for a first oneTBB program, when a parallel_for body has a data race, or when a reduction is accumulating into a shared variable. Covers parallel_for and parallel_reduce over blocked_range, the build setup, and the pitfalls of the task-based model.",
    "hwClass": "cpu",
    "products": [
      "oneTBB"
    ],
    "labels": [
      "CPU",
      "oneTBB"
    ],
    "installCommand": "npx skills add intel/skills --skill onetbb-quickstart",
    "sourceUrl": "https://github.com/intel/skills/tree/main/skills/onetbb-quickstart"
  },
  {
    "id": "performance-patterns",
    "name": "performance-patterns",
    "summary": "Detect and fix x86/C/C++ performance patterns from source code or profiling output (perf, VTune, flamegraphs).",
    "description": "Detect and fix x86/C/C++ performance patterns from source code or profiling output (perf, VTune, flamegraphs). Invoke when the user asks to optimize, review for performance, or write new SIMD/vectorized code — even without profiling data. Trigger on: serial accumulator loops, narrow SIMD (xmm/ymm that could be ymm/zmm), _mm* intrinsics, HITM/cmpxchg clusters, false sharing, missing restrict or vzeroupper, futex_wake/notify_all thundering herd, hot symbol inside a system library (.so) with a version gap, or any request to write a fast reduction, dot product, or CPU-dispatched function. Patterns: serial accumulator, TTAS spinlock, SIMD upconversion (zipper), false sharing, per-CPU stats, missing vzeroupper, missing restrict, cv-thundering-herd, mutex-to-rwlock, CPU dispatch, library version upgrade, fast CRC32C, known algorithms (Cosine Similarity, Hamming Distance, Jaccard Distance), SIMD sort (x86-simd-sort).",
    "hwClass": "cpu",
    "products": [],
    "labels": [
      "CPU"
    ],
    "installCommand": "npx skills add intel/skills --skill performance-patterns",
    "sourceUrl": "https://github.com/intel/intel-performance-skills/tree/e9d0b6410fb1ad7a50fb81e0868fd23ae886882c/skills/performance-patterns"
  },
  {
    "id": "phoronix-test-suite",
    "name": "phoronix-test-suite",
    "summary": "Install, run, parse, and optimize benchmarks from the Phoronix Test Suite (PTS).",
    "description": "Install, run, parse, and optimize benchmarks from the Phoronix Test Suite (PTS). Use this skill whenever the user mentions \"phoronix\", \"pts/\", or \"phoronix-test-suite\", or asks to run, measure, improve, or optimize a PTS test — e.g., \"run pts/mt-dgemm\", \"optimize pts/compress-zstd\", \"what score does pts/x265 get\". Trigger immediately on any <code>pts/<testname></code> reference, even if the user doesn't explicitly say \"phoronix\". Also trigger when the user asks to find or edit the source code of a PTS test.",
    "hwClass": "cpu",
    "products": [],
    "labels": [
      "CPU"
    ],
    "installCommand": "npx skills add intel/skills --skill phoronix-test-suite",
    "sourceUrl": "https://github.com/intel/intel-performance-skills/tree/e9d0b6410fb1ad7a50fb81e0868fd23ae886882c/skills/phoronix-test-suite"
  },
  {
    "id": "sglang-xpu-bench",
    "name": "sglang-xpu-bench",
    "summary": "Benchmark a <strong>running SGLang-XPU server</strong> on an Intel GPU using <code>sglang.bench_serving</code>.",
    "description": "Benchmark a <strong>running SGLang-XPU server</strong> on an Intel GPU using <code>sglang.bench_serving</code>. Measures TTFT, TPOT, ITL, end-to-end latency, and throughput against the OpenAI-compatible endpoint. Use after sglang-xpu-run. Not for vLLM servers (use vllm-xpu-bench) or no-server PyTorch (use torch-xpu-bench).",
    "hwClass": "gpu",
    "products": [
      "Intel GPU"
    ],
    "labels": [
      "GPU",
      "Intel GPU"
    ],
    "installCommand": "npx skills add intel/skills --skill sglang-xpu-bench",
    "sourceUrl": "https://github.com/intel/gpu-ai-skills/tree/3fb51a0b69527fadcdec3e4ae6b84121d39115dc/plugins/intel-gpu-ai-skills/skills/sglang-xpu-bench"
  },
  {
    "id": "sglang-xpu-run",
    "name": "sglang-xpu-run",
    "summary": "Serve a Hugging Face safetensors model on an Intel GPU using SGLang's XPU backend with the OpenAI-compatible API.",
    "description": "Serve a Hugging Face safetensors model on an Intel GPU using SGLang's XPU backend with the OpenAI-compatible API. Covers pulling the pre-built <code>intel/sglang-dev:latest</code> image, fixing the render-group and UMD/kernel compatibility issues that affect non-root sglang images, the SYCL_UR / Level Zero env vars needed on Battlemage, the <code>--device xpu --attention-backend intel_xpu</code> flag set, multimodal serving, and how to validate output content (not just HTTP 200). Use when the user needs SGLang's RadixAttention prefix caching or grammar-constrained output; for broad-coverage serving on Intel today prefer vllm-xpu-run, and for benchmarking a running server use sglang-xpu-bench.",
    "hwClass": "gpu",
    "products": [
      "Intel GPU",
      "Level Zero"
    ],
    "labels": [
      "GPU",
      "Intel GPU",
      "Level Zero"
    ],
    "installCommand": "npx skills add intel/skills --skill sglang-xpu-run",
    "sourceUrl": "https://github.com/intel/gpu-ai-skills/tree/3fb51a0b69527fadcdec3e4ae6b84121d39115dc/plugins/intel-gpu-ai-skills/skills/sglang-xpu-run"
  },
  {
    "id": "torch-xpu-bench",
    "name": "torch-xpu-bench",
    "summary": "Benchmark a Hugging Face model on an Intel GPU through pure PyTorch + Transformers, <strong>single-process, no HTTP server</strong>.",
    "description": "Benchmark a Hugging Face model on an Intel GPU through pure PyTorch + Transformers, <strong>single-process, no HTTP server</strong>. Measures generate() throughput in tokens/sec, time-to-first-token, decode-step latency, and peak XPU memory. Also covers diffusion and encoder-only models via <code>references/non-llm-snippets.md</code>. Use after <strong>model-can-it-fit</strong> to validate predicted memory against <code>torch.xpu.max_memory_allocated()</code>.",
    "hwClass": "gpu",
    "products": [
      "Intel GPU"
    ],
    "labels": [
      "GPU",
      "Intel GPU"
    ],
    "installCommand": "npx skills add intel/skills --skill torch-xpu-bench",
    "sourceUrl": "https://github.com/intel/gpu-ai-skills/tree/3fb51a0b69527fadcdec3e4ae6b84121d39115dc/plugins/intel-gpu-ai-skills/skills/torch-xpu-bench"
  },
  {
    "id": "torch-xpu-profile",
    "name": "torch-xpu-profile",
    "summary": "Profile a Hugging Face model on Intel GPU at the <strong>PyTorch level</strong> with <code>torch.profiler</code> and Kineto.",
    "description": "Profile a Hugging Face model on Intel GPU at the <strong>PyTorch level</strong> with <code>torch.profiler</code> and Kineto. Captures CPU + XPU timeline, exports Chrome trace, identifies hottest kernels and async-overlap gaps. Use when the user asks why a model is slow, which op is the bottleneck, or where the GPU is idle. Not for profiling inside a running vLLM server (use vllm-xpu-profile) or for SYCL-kernel-level signal beneath the PyTorch op layer (use xpu-profile-unitrace).",
    "hwClass": "gpu",
    "products": [
      "Intel GPU"
    ],
    "labels": [
      "GPU",
      "Intel GPU"
    ],
    "installCommand": "npx skills add intel/skills --skill torch-xpu-profile",
    "sourceUrl": "https://github.com/intel/gpu-ai-skills/tree/3fb51a0b69527fadcdec3e4ae6b84121d39115dc/plugins/intel-gpu-ai-skills/skills/torch-xpu-profile"
  },
  {
    "id": "torch-xpu-run",
    "name": "torch-xpu-run",
    "summary": "Run an arbitrary Hugging Face safetensors model on an Intel GPU using <strong>upstream PyTorch</strong> (>= 2.8) with the built-in <code>torch.xpu</code> device.",
    "description": "Run an arbitrary Hugging Face safetensors model on an Intel GPU using <strong>upstream PyTorch</strong> (>= 2.8) with the built-in <code>torch.xpu</code> device. Covers loading from the Hub, picking the right dtype, autocast, multi-GPU with accelerate's <code>device_map</code>, and the CUDA -> XPU code translation a user has to do once. Use for the Transformers / Accelerate / Diffusers path. Not for OpenAI-compatible serving (use vllm-xpu-run); explicitly not via intel-extension-for-pytorch (ipex) — that path is end-of-life and upstream PyTorch supersedes it.",
    "hwClass": "gpu",
    "products": [
      "Intel GPU"
    ],
    "labels": [
      "GPU",
      "Intel GPU"
    ],
    "installCommand": "npx skills add intel/skills --skill torch-xpu-run",
    "sourceUrl": "https://github.com/intel/gpu-ai-skills/tree/3fb51a0b69527fadcdec3e4ae6b84121d39115dc/plugins/intel-gpu-ai-skills/skills/torch-xpu-run"
  },
  {
    "id": "vllm-xpu-bench",
    "name": "vllm-xpu-bench",
    "summary": "Benchmark a <strong>running vLLM-XPU OpenAI-compatible server</strong> on an Intel GPU using <code>vllm bench</code>.",
    "description": "Benchmark a <strong>running vLLM-XPU OpenAI-compatible server</strong> on an Intel GPU using <code>vllm bench</code>. Measures TTFT (time-to-first-token), TPOT (time-per-output-token), ITL (inter-token latency), end-to-end latency, and throughput under concurrency. Covers online (<code>vllm bench serve</code>) and offline (<code>vllm bench throughput</code>) modes; concurrency sweeps and quant comparison live in <code>references/sweep-and-compare.md</code>. Use after <strong>vllm-xpu-run</strong> when the user asks \"how fast is this?\".",
    "hwClass": "gpu",
    "products": [
      "Intel GPU"
    ],
    "labels": [
      "GPU",
      "Intel GPU"
    ],
    "installCommand": "npx skills add intel/skills --skill vllm-xpu-bench",
    "sourceUrl": "https://github.com/intel/gpu-ai-skills/tree/3fb51a0b69527fadcdec3e4ae6b84121d39115dc/plugins/intel-gpu-ai-skills/skills/vllm-xpu-bench"
  },
  {
    "id": "vllm-xpu-profile",
    "name": "vllm-xpu-profile",
    "summary": "Profile a running vLLM-XPU server with torch.profiler around a window of real requests, either via /start_profile and /stop_profile HTTP endpoints or via vllm bench --profile for offline runs.",
    "description": "Profile a running vLLM-XPU server with torch.profiler around a window of real requests, either via /start_profile and /stop_profile HTTP endpoints or via vllm bench --profile for offline runs. Use to find the dominant op under real concurrent traffic. Not for pure PyTorch (use torch-xpu-profile), SYCL kernel-level signal (use xpu-profile-unitrace), throughput numbers (use vllm-xpu-bench), or non-vLLM servers.",
    "hwClass": "gpu",
    "products": [],
    "labels": [
      "GPU"
    ],
    "installCommand": "npx skills add intel/skills --skill vllm-xpu-profile",
    "sourceUrl": "https://github.com/intel/gpu-ai-skills/tree/3fb51a0b69527fadcdec3e4ae6b84121d39115dc/plugins/intel-gpu-ai-skills/skills/vllm-xpu-profile"
  },
  {
    "id": "vllm-xpu-run",
    "name": "vllm-xpu-run",
    "summary": "Serve a Hugging Face safetensors model on an Intel GPU with upstream vLLM-XPU's OpenAI-compatible API.",
    "description": "Serve a Hugging Face safetensors model on an Intel GPU with upstream vLLM-XPU's OpenAI-compatible API. Covers image choice, container launch, the right vllm serve flags (dtype, enforce-eager, model-impl fallback, attention backend, quant + KV-cache pairing), and the transformers-backend fallback for unsupported architectures. Use for /v1/chat/completions or /v1/completions on an Intel GPU. Not for pure PyTorch without a server (use torch-xpu-run), throughput numbers (use vllm-xpu-bench), or NVIDIA (use vllm-project/vllm-skills).",
    "hwClass": "gpu",
    "products": [
      "Intel GPU"
    ],
    "labels": [
      "GPU",
      "Intel GPU"
    ],
    "installCommand": "npx skills add intel/skills --skill vllm-xpu-run",
    "sourceUrl": "https://github.com/intel/gpu-ai-skills/tree/3fb51a0b69527fadcdec3e4ae6b84121d39115dc/plugins/intel-gpu-ai-skills/skills/vllm-xpu-run"
  },
  {
    "id": "xpu-container-run",
    "name": "xpu-container-run",
    "summary": "Launch a Docker container with Intel GPU access on Linux.",
    "description": "Launch a Docker container with Intel GPU access on Linux. Encodes the correct combination of <code>--device /dev/dri</code>, render-group access, <code>--ipc=host</code>, <code>ZE_AFFINITY_MASK</code> pinning, Hugging Face cache mount, and <code>--entrypoint /bin/bash</code> for interactive use. Use when running any Intel-XPU container (vLLM-XPU, sglang-xpu, torch-XPU, llama.cpp SYCL, etc.) and the device must be visible inside. The CUDA analogue is <code>docker run --gpus all</code> — Intel has no <code>--gpus</code> flag, you pass the Direct Rendering Manager (DRM) nodes directly.",
    "hwClass": "gpu",
    "products": [
      "Intel GPU"
    ],
    "labels": [
      "GPU",
      "Intel GPU"
    ],
    "installCommand": "npx skills add intel/skills --skill xpu-container-run",
    "sourceUrl": "https://github.com/intel/gpu-ai-skills/tree/3fb51a0b69527fadcdec3e4ae6b84121d39115dc/plugins/intel-gpu-ai-skills/skills/xpu-container-run"
  },
  {
    "id": "xpu-deploy-plan",
    "name": "xpu-deploy-plan",
    "summary": "Plan an end-to-end Intel XPU model deployment by chaining existing skills.",
    "description": "Plan an end-to-end Intel XPU model deployment by chaining existing skills. Calls xpu-runtime-preflight (readiness), model-can-it-fit (sizing), model-config-recommend (flags), and the selected runtime skill (vllm-xpu-run / sglang-xpu-run / torch-xpu-run), then writes a single PLAN.md with one exact launch command, smoke test, and rollback to .out/skills/xpu-deploy-plan/. Use when the user asks for a coordinated plan (not a direct deploy/serve request) — wants the orchestration across preflight, fit, config, launch, smoke test, and rollback, or asks which skills to run and in what order.",
    "hwClass": "gpu",
    "products": [
      "Intel XPU"
    ],
    "labels": [
      "GPU",
      "Intel XPU"
    ],
    "installCommand": "npx skills add intel/skills --skill xpu-deploy-plan",
    "sourceUrl": "https://github.com/intel/gpu-ai-skills/tree/3fb51a0b69527fadcdec3e4ae6b84121d39115dc/plugins/intel-gpu-ai-skills/skills/xpu-deploy-plan"
  },
  {
    "id": "xpu-discover",
    "name": "xpu-discover",
    "summary": "Inventory Intel GPUs (Arc, Arc Pro, Data Center GPU Max) on a Linux host.",
    "description": "Inventory Intel GPUs (Arc, Arc Pro, Data Center GPU Max) on a Linux host. Detect devices, check driver health, list processes using each XPU, run a quick diagnostic, and read live utilisation.",
    "hwClass": "gpu",
    "products": [
      "Intel Arc",
      "Intel Arc Pro",
      "Intel Data Center GPU Max"
    ],
    "labels": [
      "GPU",
      "Intel Arc",
      "Intel Arc Pro",
      "Intel Data Center GPU Max"
    ],
    "installCommand": "npx skills add intel/skills --skill xpu-discover",
    "sourceUrl": "https://github.com/intel/gpu-ai-skills/tree/3fb51a0b69527fadcdec3e4ae6b84121d39115dc/plugins/intel-gpu-ai-skills/skills/xpu-discover"
  },
  {
    "id": "xpu-model-type-detect",
    "name": "xpu-model-type-detect",
    "summary": "Before loading a Hugging Face model on Intel XPU, detect its actual type (text generation, text encoder, seq2seq, vision classification, vision-language, audio encoder, audio seq2seq, multimodal VL, diffusion, time-series, reward model, masked LM) so the agent picks the right <code>AutoModel</code> class and input kwargs.",
    "description": "Before loading a Hugging Face model on Intel XPU, detect its actual type (text generation, text encoder, seq2seq, vision classification, vision-language, audio encoder, audio seq2seq, multimodal VL, diffusion, time-series, reward model, masked LM) so the agent picks the right <code>AutoModel</code> class and input kwargs. Prevents \"got unexpected keyword argument 'pixel_values'\" and \"empty logits\" errors from mis-routing. Use before <code>torch-xpu-run</code> or <code>vllm-xpu-run</code> when the user gives a model id the agent hasn't seen before, or when a smoke test fails with a wrong-input signature.",
    "hwClass": "gpu",
    "products": [
      "Intel XPU"
    ],
    "labels": [
      "GPU",
      "Intel XPU"
    ],
    "installCommand": "npx skills add intel/skills --skill xpu-model-type-detect",
    "sourceUrl": "https://github.com/intel/gpu-ai-skills/tree/3fb51a0b69527fadcdec3e4ae6b84121d39115dc/plugins/intel-gpu-ai-skills/skills/xpu-model-type-detect"
  },
  {
    "id": "xpu-port",
    "name": "xpu-port",
    "summary": "Execute a single-target CUDA-to-XPU port of a PyTorch repo with libcst-based scan, mechanical rewrite, and CPU FP64 vs target-dtype correctness verify on one forward pass.",
    "description": "Execute a single-target CUDA-to-XPU port of a PyTorch repo with libcst-based scan, mechanical rewrite, and CPU FP64 vs target-dtype correctness verify on one forward pass. Use when the request says \"port\" — \"port my repo to XPU\", \"port my repo at <path> to XPU\", \"rewrite the CUDA calls to XPU\", \"apply the mechanical transforms\", \"run the scan and rewrite\", \"make the port changes now\". Not for the \"migrate\" verb (\"migrate my repo\", \"migrate this repo to XPU\") or a bare whole-repo workflow request where scope is not yet set — those start with cuda-to-xpu-migration, whose plan routes here. Not for assessment-only, throughput (torch-xpu-bench), op-level slowness (torch-xpu-profile), custom CUDA C++ extensions, or dual-target CUDA+XPU codebases.",
    "hwClass": "gpu",
    "products": [],
    "labels": [
      "GPU"
    ],
    "installCommand": "npx skills add intel/skills --skill xpu-port",
    "sourceUrl": "https://github.com/intel/gpu-ai-skills/tree/3fb51a0b69527fadcdec3e4ae6b84121d39115dc/plugins/intel-gpu-ai-skills/skills/xpu-port"
  },
  {
    "id": "xpu-profile-unitrace",
    "name": "xpu-profile-unitrace",
    "summary": "Profile Intel-XPU workloads at the SYCL / Level Zero kernel level via Intel pti-gpu's unitrace.",
    "description": "Profile Intel-XPU workloads at the SYCL / Level Zero kernel level via Intel pti-gpu's unitrace. Captures per-API-call and per-kernel timing, memory transfers, oneCCL / MPI events, and hardware counters PyTorch-level profilers cannot see. Use when a hot op is already known at the torch.profiler layer and the user needs the SYCL kernel beneath, or when profiling oneCCL collectives in multi-GPU runs. Not for PyTorch-level signal (use torch-xpu-profile / vllm-xpu-profile). Requires building unitrace from source.",
    "hwClass": "gpu",
    "products": [
      "Intel XPU",
      "pti-gpu",
      "oneCCL"
    ],
    "labels": [
      "GPU",
      "Intel XPU",
      "pti-gpu",
      "oneCCL"
    ],
    "installCommand": "npx skills add intel/skills --skill xpu-profile-unitrace",
    "sourceUrl": "https://github.com/intel/gpu-ai-skills/tree/3fb51a0b69527fadcdec3e4ae6b84121d39115dc/plugins/intel-gpu-ai-skills/skills/xpu-profile-unitrace"
  },
  {
    "id": "xpu-runtime-preflight",
    "name": "xpu-runtime-preflight",
    "summary": "Run a read-only go/no-go preflight before any Intel GPU/XPU skillpack work.",
    "description": "Run a read-only go/no-go preflight before any Intel GPU/XPU skillpack work. Checks driver health, /dev/dri permissions, render/video groups, Docker, /dev/shm, disk, proxy, and optional container-level XPU visibility. Use when the user asks whether a machine is ready for XPU model work or needs a reusable lab readiness report. Not for launching workloads, pulling images, editing system config, or verifying model output.",
    "hwClass": "gpu",
    "products": [
      "Intel GPU"
    ],
    "labels": [
      "GPU",
      "Intel GPU"
    ],
    "installCommand": "npx skills add intel/skills --skill xpu-runtime-preflight",
    "sourceUrl": "https://github.com/intel/gpu-ai-skills/tree/3fb51a0b69527fadcdec3e4ae6b84121d39115dc/plugins/intel-gpu-ai-skills/skills/xpu-runtime-preflight"
  },
  {
    "id": "xpu-system-setup",
    "name": "xpu-system-setup",
    "summary": "First-time setup for Intel XPU/GPU hosts.",
    "description": "First-time setup for Intel XPU/GPU hosts. Detects what's missing and installs xpu-smi, configures user groups (render), sets up Intel GPU PPA repository, installs Level Zero runtime, installs Docker, and runs a post-setup verification gate. Prompts before each installation by default (use --auto for unattended). Also handles Battlemage (Arc Pro B60/B70) prerequisites on Ubuntu 24.04: nomodeset removal, OEM kernel upgrade, and compute runtime 26.18+ — use check_battlemage_prerequisites.sh when xpu-smi shows No device discovered or clinfo shows 0 platforms. Use when a bare-metal or minimally-configured machine needs to be prepared for XPU model work.",
    "hwClass": "gpu",
    "products": [
      "Intel GPU",
      "Intel Arc Pro",
      "xpu-smi",
      "Level Zero"
    ],
    "labels": [
      "GPU",
      "Intel GPU",
      "Intel Arc Pro",
      "xpu-smi",
      "Level Zero"
    ],
    "installCommand": "npx skills add intel/skills --skill xpu-system-setup",
    "sourceUrl": "https://github.com/intel/gpu-ai-skills/tree/3fb51a0b69527fadcdec3e4ae6b84121d39115dc/plugins/intel-gpu-ai-skills/skills/xpu-system-setup"
  }
];

function cleanText(str: string): string {
  if (!str) return "";
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseSkillsRegex(html: string): Skill[] {
  const dialogMap = new Map<
    string,
    { description: string; installCommand: string; sourceUrl: string }
  >();
  const dialogRegex = /<dialog\b[^>]*data-skill-dialog="([^"]+)"[^>]*>([\s\S]*?)<\/dialog>/gi;
  let dMatch: RegExpExecArray | null;
  while ((dMatch = dialogRegex.exec(html)) !== null) {
    const id = dMatch[1];
    const content = dMatch[2];
    const descMatch = content.match(
      /<p\b[^>]*class="[^"]*dialog__description[^"]*"[^>]*>([\s\S]*?)<\/p>/i
    );
    const cmdMatch = content.match(
      /<code\b[^>]*class="[^"]*install__command[^"]*"[^>]*>([\s\S]*?)<\/code>/i
    );
    const srcMatch = content.match(
      /<a\b[^>]*class="[^"]*source[^"]*"[^>]*href="([^"]+)"/i
    );

    dialogMap.set(id, {
      description: cleanText(descMatch ? descMatch[1] : ""),
      installCommand: cmdMatch
        ? cleanText(cmdMatch[1])
        : `npx skills add intel/skills --skill ${id}`,
      sourceUrl: srcMatch
        ? srcMatch[1].trim()
        : `https://github.com/intel/skills/tree/main/skills/${id}`,
    });
  }

  const itemRegex = /<li\b[^>]*data-skill-item[^>]*>([\s\S]*?)<\/li>/gi;
  let iMatch: RegExpExecArray | null;
  const skills: Skill[] = [];
  while ((iMatch = itemRegex.exec(html)) !== null) {
    const itemHtml = iMatch[0];
    const innerHtml = iMatch[1];

    const hwMatch = itemHtml.match(/data-facet-hw="([^"]*)"/i);
    const hwClass = hwMatch && hwMatch[1] ? hwMatch[1].toLowerCase() : "";

    const prodMatch = itemHtml.match(/data-facet-product="([^"]*)"/i);
    const products =
      prodMatch && prodMatch[1]
        ? prodMatch[1]
            .split("|")
            .map((p) => cleanText(p))
            .filter(Boolean)
        : [];

    const nameMatch = innerHtml.match(
      /<h2\b[^>]*class="[^"]*card__name[^"]*"[^>]*>([\s\S]*?)<\/h2>/i
    );
    const name = nameMatch ? cleanText(nameMatch[1]) : "";
    if (!name) continue;

    const summaryMatch = innerHtml.match(
      /<p\b[^>]*class="[^"]*card__summary[^"]*"[^>]*>([\s\S]*?)<\/p>/i
    );
    const summary = summaryMatch ? cleanText(summaryMatch[1]) : "";

    const dialogData = dialogMap.get(name) || {
      description: "",
      installCommand: "",
      sourceUrl: "",
    };
    const labels: string[] = [];
    if (hwClass) labels.push(hwClass.toUpperCase());
    products.forEach((p) => {
      if (!labels.includes(p)) labels.push(p);
    });

    skills.push({
      id: name,
      name,
      summary: summary || dialogData.description || "",
      description: dialogData.description || summary || "",
      hwClass,
      products,
      labels,
      installCommand:
        dialogData.installCommand || `npx skills add intel/skills --skill ${name}`,
      sourceUrl:
        dialogData.sourceUrl ||
        `https://github.com/intel/skills/tree/main/skills/${name}`,
    });
  }

  return skills;
}

export function parseSkillsHtml(html: string): Skill[] {
  if (typeof window !== "undefined" && typeof DOMParser !== "undefined") {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const dialogMap = new Map<
        string,
        { description: string; installCommand: string; sourceUrl: string }
      >();
      const dialogs = doc.querySelectorAll<HTMLElement>("dialog[data-skill-dialog]");
      dialogs.forEach((dialog) => {
        const id = dialog.getAttribute("data-skill-dialog");
        if (!id) return;
        const desc =
          dialog.querySelector(".dialog__description")?.textContent?.trim() || "";
        const installCmd =
          dialog.querySelector(".install__command")?.textContent?.trim() ||
          `npx skills add intel/skills --skill ${id}`;
        const sourceUrl =
          dialog.querySelector<HTMLAnchorElement>("a.source")?.getAttribute("href") ||
          `https://github.com/intel/skills/tree/main/skills/${id}`;
        dialogMap.set(id, { description: desc, installCommand: installCmd, sourceUrl });
      });

      const items = doc.querySelectorAll<HTMLElement>("li[data-skill-item]");
      const skills: Skill[] = [];

      items.forEach((item) => {
        const hwClass = item.getAttribute("data-facet-hw")?.toLowerCase() || "";
        const productsAttr = item.getAttribute("data-facet-product") || "";
        const products = productsAttr
          ? productsAttr
              .split("|")
              .map((p) => p.trim())
              .filter(Boolean)
          : [];

        const name = item.querySelector(".card__name")?.textContent?.trim() || "";
        if (!name) return;

        const summary =
          item.querySelector(".card__summary")?.textContent?.trim() || "";
        const dialogData = dialogMap.get(name);

        const labels: string[] = [];
        if (hwClass) labels.push(hwClass.toUpperCase());
        products.forEach((p) => {
          if (!labels.includes(p)) labels.push(p);
        });

        skills.push({
          id: name,
          name,
          summary: summary || dialogData?.description || "",
          description: dialogData?.description || summary || "",
          hwClass,
          products,
          labels,
          installCommand:
            dialogData?.installCommand || `npx skills add intel/skills --skill ${name}`,
          sourceUrl:
            dialogData?.sourceUrl ||
            `https://github.com/intel/skills/tree/main/skills/${name}`,
        });
      });

      if (skills.length > 0) {
        return skills;
      }
    } catch (e) {
      console.warn("DOMParser failed, falling back to regex parser", e);
    }
  }

  return parseSkillsRegex(html);
}

export const SKILLS_CATALOG_URL = "https://intel.github.io/skills/";

export function mergeCatalogSkills(intelSkills: Skill[]): Skill[] {
  const pinnedMap = new Map<string, { order: number; badge?: string }>();
  PINNED_SKILLS.forEach((entry, index) => {
    if (typeof entry === "string") {
      pinnedMap.set(entry, { order: index });
    } else {
      pinnedMap.set(entry.id, { order: index, badge: entry.badge });
    }
  });

  const toolkitIds = new Set(TOOLKIT_SKILLS.map((s) => s.id));
  const combined: Skill[] = [
    ...TOOLKIT_SKILLS.map((skill) => ({
      ...skill,
      source: "toolkit" as const,
    })),
    ...intelSkills
      .filter((skill) => !toolkitIds.has(skill.id))
      .map((skill) => ({
        ...skill,
        source: (skill.source || "intel") as SkillSource,
      })),
  ].map((skill) => {
    const pinInfo = pinnedMap.get(skill.id);
    if (!pinInfo && !skill.pinned) {
      return skill;
    }
    return {
      ...skill,
      pinned: true,
      pinnedBadge: pinInfo?.badge ?? skill.pinnedBadge ?? "Pinned",
    };
  });

  return combined.sort((a, b) => {
    const aPin = pinnedMap.get(a.id);
    const bPin = pinnedMap.get(b.id);
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (aPin && bPin) return aPin.order - bPin.order;
    if (a.source === "toolkit" && b.source !== "toolkit") return -1;
    if (a.source !== "toolkit" && b.source === "toolkit") return 1;
    return a.name.localeCompare(b.name);
  });
}

export const INITIAL_SKILLS: Skill[] = mergeCatalogSkills(FALLBACK_SKILLS);

export async function fetchSkills(): Promise<Skill[]> {
  const response = await fetch(SKILLS_CATALOG_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch skills from ${SKILLS_CATALOG_URL}: ${response.statusText}`);
  }
  const html = await response.text();
  const skills = parseSkillsHtml(html);
  if (skills.length === 0) {
    throw new Error("No skills found in fetched catalog");
  }
  return mergeCatalogSkills(skills);
}

export const skillsQueryOptions = () =>
  queryOptions({
    queryKey: ["intel-skills"],
    queryFn: fetchSkills,
    initialData: INITIAL_SKILLS,
    staleTime: 10 * 60 * 1000,
  });

export default INITIAL_SKILLS;
