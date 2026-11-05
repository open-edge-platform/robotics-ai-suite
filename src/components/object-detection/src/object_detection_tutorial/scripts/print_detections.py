#!/usr/bin/env python3
# Copyright (C) 2026 Intel Corporation
#
# SPDX-License-Identifier: Apache-2.0

"""Print a one-line summary of object detection results, for runs without a display."""

import sys

from object_msgs.msg import ObjectsInBoxes
import rclpy
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node


def summarize(objects, limit=8):
    """Return 'label confidence, ...' for (label, confidence) pairs, most confident first."""
    ranked = sorted(objects, key=lambda obj: obj[1], reverse=True)
    text = ', '.join(f'{label} {confidence:.2f}' for label, confidence in ranked[:limit])
    if len(ranked) > limit:
        text += f', ... ({len(ranked)} objects)'
    return text or 'no objects'


class DetectionPrinter(Node):

    def __init__(self):
        super().__init__('detection_printer')
        topic = self.declare_parameter('topic', '/ros2_openvino_toolkit/detected_objects').value
        self.period = float(self.declare_parameter('period', 1.0).value)
        self.latest = None
        self.count = 0
        self.create_subscription(ObjectsInBoxes, topic, self.on_message, 10)
        self.create_timer(self.period, self.report)
        print(f'Printing detections from {topic} every {self.period:g} s', flush=True)

    def on_message(self, msg):
        self.latest = msg
        self.count += 1

    def report(self):
        if not self.count:
            return
        objects = [
            (box.object.object_name, box.object.probability) for box in self.latest.objects_vector
        ]
        print(f'{self.count / self.period:.0f} msg/s | {summarize(objects)}', flush=True)
        self.count = 0


def main(args=None):
    rclpy.init(args=args)
    node = DetectionPrinter()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        pass
    finally:
        node.destroy_node()
        rclpy.try_shutdown()
    return 0


if __name__ == '__main__':
    sys.exit(main())
