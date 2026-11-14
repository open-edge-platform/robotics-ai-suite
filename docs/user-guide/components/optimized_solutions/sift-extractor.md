# GPU SIFT Extractor

GPU SIFT Extractor is a **ROS-distro packaged C++ library** (same pattern as
[GPU ORB Extractor](./orb-extractor.md)). It is **not** a standalone
`rclcpp` / `rclpy` node: link it from your ROS node or SIFT-capable SLAM
front-end and call `extract()` on each frame.

It is a thin wrapper around the horizontal `sift-extractor` core in Edge AI
Libraries. Kernels are not duplicated in the robotics package; debian packaging
builds the sibling core and links it into `libsift_lze` / `libsift_lze_ocvfree`.

## Descriptor contract

SIFT produces **128-D float descriptors** matched with **L2** distance.
Keep your existing float-SIFT matcher / vocabulary. This package does **not**
replace ORB binary descriptors or Hamming matchers.

## Overview and Installation

### System requirements

- Ubuntu 22.04 (Humble / Jammy) or Ubuntu 24.04 (Jazzy / Noble)
- Intel GPU with a working OpenCL ICD; Level Zero + matching oneAPI SYCL
  runtime if you use the SYCL backend
- OpenCV 4.x for the OpenCV-linked library (`libsift_lze`)

### Deb packages

| Package | Role |
| --- | --- |
| `libsift-lze` | Shared libraries (`libsift_lze.so`, `libsift_lze_ocvfree.so`) |
| `libsift-lze-dev` | Headers, CMake (`find_package(siftlze)`), pkg-config, samples |
| `sift-extractor-lze-test` | Internal smoke tests (optional on target) |

Source package names follow Robotics AI Suite convention:
`ros-humble-sift-extractor` (Jammy) and `ros-jazzy-sift-extractor` (Noble).

### Prerequisites

Complete the [Getting Started](../../platform_foundation/getting_started.md) guide before continuing.

### Install Deb Packages

```bash
sudo apt update
sudo apt install libsift-lze libsift-lze-dev
```

Build from source in Edge AI Libraries:

```bash
cd edge-ai-libraries/libraries/robotics-ai-libraries/sift-extractor
# Corporate networks: export http_proxy / https_proxy; do not put .intel.com
# in no_proxy or apt.repos.intel.com will bypass the proxy.
make build ROS_DISTRO=humble   # or jazzy
sudo dpkg -i libsift-lze_*.deb libsift-lze-dev_*.deb
```

Samples install under `/opt/intel/sift_lze/samples/`. Smoke tests (if you
install the test package) live under `/opt/intel/sift_lze/tests/`.

### Quick verify

```bash
sift_feature_extract --image=/path/to/gray_or_bgr.png --backend=auto
```

| Variable | Effect |
| --- | --- |
| `SIFT_BACKEND` | `auto` \| `opencl` \| `sycl` (overrides constructor backend) |

## Use the OpenCV Library

```cmake
find_package(siftlze REQUIRED)
find_package(OpenCV REQUIRED COMPONENTS core imgcodecs imgproc)
add_executable(my_app main.cpp)
target_link_libraries(my_app PRIVATE sift_lze ${OpenCV_LIBS})
```

### Mono extract

```cpp
#include "sift_lze.h"

#include <opencv2/imgcodecs.hpp>
#include <opencv2/imgproc.hpp>

cv::Mat gray = cv::imread("frame.png", cv::IMREAD_GRAYSCALE);
sift_lze extractor(/*max*/ 0, /*octaves*/ 5, /*contrast*/ 1.0f, /*cameras*/ 1, "auto");

std::vector<std::vector<cv::KeyPoint>> keypts;
std::vector<cv::Mat> descriptors;  // CV_32F, Nx128
extractor.extract(gray, cv::noArray(), keypts, descriptors);

// keypts[0], descriptors[0] — match with L2 (cv::NORM_L2), not Hamming.
```

### Multi-camera extract

All frames in one call must share the same width and height:

```cpp
std::vector<cv::Mat> frames{left_gray, right_gray};
sift_lze extractor(0, 5, 1.0f, /*cameras*/ 2, "auto");

std::vector<std::vector<cv::KeyPoint>> keypts;
std::vector<cv::Mat> descriptors;
extractor.extract(frames, cv::noArray(), keypts, descriptors);
```

### Backend selection

- Constructor argument: `"auto"`, `"opencl"`, or `"sycl"`.
- Environment override: `SIFT_BACKEND=opencl|sycl|auto`.
- After the first successful extract, `get_resolved_backend()` reports which
  backend ran.

### Sample binary

```bash
sift_feature_extract --image=/path/to/image.png --images=1 --backend=auto \
  --octaves=5 --contrast=1.0
```

## Use the OpenCV-free Library

Link `sift_lze_ocvfree` and define the OpenCV-free types from `sift_type.h`
(`Mat2d`, `DescMat2d`, `KeyPoint`).

```cmake
find_package(siftlze REQUIRED)
target_link_libraries(my_app PRIVATE sift_lze_ocvfree)
```

```cpp
#define OPENCV_FREE
#include "sift_lze.h"

Mat2d image(/*height*/480, /*width*/640, /*fill*/(unsigned char)32);
sift_lze extractor(0, 5, 1.0f, 1, "auto");
std::vector<Mat2d> images{image};
std::vector<Mat2d> masks;
std::vector<std::vector<KeyPoint>> keypts;
std::vector<DescMat2d> descriptors; // float rows, 128 cols
extractor.extract(images, masks, keypts, descriptors);
```

Host-side rectangle masks use the same quarter-grid convention as ORB
(`mask_rects` of `{x0,x1,y0,y1}` in units of width/4 and height/4); excluded
regions are zeroed before extract.

## Integrate into a SIFT-capable SLAM

Use this when your SLAM (or ROS node) **already** expects SIFT-style
**keypoints + 128-D float descriptors** and L2 matching. Replace only the
unoptimized extract step with this library.

This is **not** an ORB swap and **not** a binary drop-in for
`cv::SIFT::create()`. Adapt the call site; keep your L2 matcher, vocabulary,
and pose graph unchanged.

### Link from your package / node

```cmake
find_package(siftlze REQUIRED)
find_package(OpenCV REQUIRED COMPONENTS core imgproc)

target_link_libraries(your_slam_or_node
  PRIVATE
    sift_lze
    ${OpenCV_LIBS}
)
```

pkg-config alternative:

```bash
pkg-config --cflags --libs siftlze
```

### Construct once, extract every frame

```cpp
#include "sift_lze.h"

#include <opencv2/core.hpp>
#include <opencv2/imgproc.hpp>

sift_lze extractor(
    /*max_num_keypts*/ 0,
    /*num_octaves*/ 5,
    /*contrast_threshold*/ 1.0f,
    /*no_of_cameras*/ 1,
    /*backend*/ "auto");

void on_frame(const cv::Mat &bgr_or_gray) {
  cv::Mat gray;
  if (bgr_or_gray.channels() == 1)
    gray = bgr_or_gray;
  else
    cv::cvtColor(bgr_or_gray, gray, cv::COLOR_BGR2GRAY);

  std::vector<std::vector<cv::KeyPoint>> keypts;
  std::vector<cv::Mat> descriptors;

  extractor.extract(gray, cv::noArray(), keypts, descriptors);
  // Feed keypts[0] + descriptors[0] into your existing L2 SIFT pipeline.
}
```

Stereo / multi-camera: pass `std::vector<cv::Mat>` of **identical resolution**,
set `no_of_cameras` to the vector length, and consume `keypts[i]` /
`descriptors[i]` per camera.

### Map outputs into your SLAM types

| This library | Typical SIFT SLAM expectation |
| --- | --- |
| `cv::KeyPoint` (`pt`, `size`, `angle`, `response`, `octave`) | Same fields; confirm your scale pyramid uses diameter ≈ `2 * σ` style size |
| `cv::Mat` `CV_32F` Nx128 | L2 / float BoW — keep as-is |
| Multi-cam `vector` of mats | Flatten or index per camera stream |

Suggested checklist when swapping an unoptimized extract:

1. Call GPU extract instead of OpenCV / CPU SIFT on the same grayscale frame.
2. Leave matcher distance as **L2** (`cv::NORM_L2` or equivalent).
3. Retune **contrast** and **octaves** until keypoint count / tracking quality
   matches your previous front-end (OpenCL and SYCL thresholds are not
   algorithm-equivalent; see [Limitations](#limitations)).
4. Confirm runtime: Intel GPU visible (`clinfo` / Level Zero), and for SYCL
   source `/opt/intel/oneapi/setvars.sh` in the environment that launches the
   node if required by your install.

### Runtime knobs

| Knob | How |
| --- | --- |
| Backend | Constructor string, or `SIFT_BACKEND=opencl\|sycl\|auto` |
| Contrast / octaves / max features | Constructor or setters on `sift_lze` |
| Resolved backend | `extractor.get_resolved_backend()` after first extract |

### What you do not get from this package

- No ready-made ROS topic publisher / subscriber node
- No Collaborative SLAM / OpenVSLAM feature-module flag (that stack is ORB)
- No silent CPU fallback if GPU / ICD / SYCL runtime is missing

If your stack is ORB + Hamming, use the [GPU ORB Extractor](./orb-extractor.md)
instead.

## Limitations

1. All images passed to one `sift_lze` object in a single `extract` call must
   share the same width and height. Different resolutions need separate objects.
2. GPU mask support is host-side only (zero fill / rect masks). There is no
   core GPU mask path yet.
3. Descriptors are float L2 — incompatible with ORB Hamming matchers and
   binary-descriptor SLAM front-ends without an adapter.
4. Requires an Intel GPU with a working OpenCL ICD and/or Level Zero + oneAPI
   SYCL runtime matching the package Build-Depends. Unsupported distros/runtimes
   are not silently redirected to CPU.
5. OpenCL and SYCL contrast knobs are **not** algorithm-equivalent; use quality
   matching when comparing backends.
