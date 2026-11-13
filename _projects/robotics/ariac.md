---
permalink: /projects/ariac/
title: Industrial robotics with ARIAC
short_title: ARIAC
category: Robotics
context: Course project
discipline: ROS2 / AUTOMATION
tags:
- ROS2
- C++
- Python
- Computer vision
summary: My team developed control system logic and vision based part identification and management for manufacturing tasks in the ARIAC 2023 simulation.
order: 1
featured: true
repository: https://github.com/gautamsrn/ariac_group-2/tree/final-release
reference: https://www.nist.gov/el/intelligent-systems-division-73500/agile-robotics-industrial-automation-competition/about-ariac
reference_label: About ARIAC at NIST
document: https://pages.nist.gov/ARIAC_docs/en/2023.5.0/index.html
document_label: ARIAC 2023 documentation
demo: https://youtu.be/UNrx3sP3ag0
demo_label: Watch 1-minute demo
full_demo: https://drive.google.com/file/d/1QfORAyQMUxwzTLDuGoLFcy2qUh5tNSN_/view
full_demo_label: Watch full demo
media:
  type: embed
  src: https://www.youtube-nocookie.com/embed/UNrx3sP3ag0
  poster: /assets/projects/ariac/video-poster.jpg
  alt: One-minute demonstration of the ARIAC manufacturing simulation in Gazebo
  caption: A one-minute look at the course project in the ARIAC 2023 simulation environment.
  duration: 1 min
---
## Working with ARIAC

I worked with ARIAC 2023 in the University of Maryland course Building a Manufacturing Robotic Software System. The project included working and developing the software system for managing the Manufacturing Plant in C++ and Python.

## The workcell

The ARIAC workcell includes floor and ceiling robots, automated guided vehicles, part bins, and a conveyor belt. It supports kitting and assembly tasks. The [workcell overview](https://pages.nist.gov/ARIAC_docs/en/2023.5.0/competition/environment.html) covers the layout and equipment. ARIAC also includes optional [agility challenges](https://pages.nist.gov/ARIAC_docs/en/2023.5.0/competition/challenges.html), such as faulty parts, sensor outages, robot malfunctions, and high-priority orders.

## My part of the project

I designed and implemented control software for manufacturing tasks. I also used computer vision and object detection to identify parts from RGB camera images in Gazebo and process the manufacturing orders as required. This includes perceiving the environment, planning and deciding the next action and executing the order by moving required parts using available robotic systems - From sensing to autonomous order fulfillment.

This work included tools and techniques involing ROS2, C++, Python, and multithreading.

## Architecture decisions
{: #architecture-decision-record }

These decisions explain how our team took decisions to handle specific requirements in the project. Each record links to the implementation in `final-release`. Expand a decision for its context, alternatives, and tradeoffs.

{% include architecture-decisions.html adrs=site.data.ariac_adrs %}
