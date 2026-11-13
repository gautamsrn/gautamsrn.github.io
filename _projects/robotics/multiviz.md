---
permalink: /projects/multiviz/
title: MultiViz - A tool for managing multi-robot systems
short_title: MultiViz
category: Robotics
context: ROS 2 visualization & control
discipline: MULTI-ROBOT / VISUALIZATION
tags: [ROS 2, Multi-robot systems, Visualization, Robot control, Gazebo]
summary: My team built a ROS 2 interface to help researchers and the robotics community visualize, control, and manage multiple robot systems in one place.
order: 15
featured: true
repository: https://github.com/SwarajMundruppadyRao/Multi-Viz-A-ROS2-based-GUI-for-Multi-Robot-Coordination/tree/main
demo: https://youtu.be/TaRLLyffFE0
demo_label: Watch 1-minute demo
full_demo: https://youtu.be/EBuJMht2ZNw
full_demo_label: Watch full demo
media:
  type: embed
  src: https://www.youtube-nocookie.com/embed/TaRLLyffFE0
  poster: /assets/projects/multiviz/video-poster.jpg
  alt: One-minute demonstration of the MultiViz robot visualization and control interface
  caption: A one-minute overview of robot selection, motion controls, and sensor views in MultiViz.
  duration: 1 min
---

## Why we built MultiViz

We built MultiViz to help researchers and the wider robotics community manage multiple robots from one place. We wanted to bring controls and sensor data together so users could see what each robot was doing and control it from the same interface.

## One interface, multiple robots

From the ROS 2 interface, we can select a robot, send motion commands, set waypoints, and check its camera and disparity views. The multi-robot environment stays visible alongside the controls.

## From simulation to hardware

We demonstrated MultiViz in Gazebo. We designed it for use with ROS-based systems in any environment including simulation and real-world.

## Architecture decisions
{: #architecture-decision-record }

These records describe the architectural choices taken by our team. Expand a decision for its context and implementation references.

{% include architecture-decisions.html adrs=site.data.multiviz_adrs %}
