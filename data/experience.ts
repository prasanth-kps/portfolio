import type { View } from "@/data/views";

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  type: string;
  // Default (General) bullets, plus optional tailored sets for the other views.
  highlights: string[];
  views?: Partial<Record<Exclude<View, "general">, string[]>>;
  skills: string[];
  skillsByView?: Partial<Record<Exclude<View, "general">, string[]>>;
}

export const bulletsFor = (e: Experience, view: View) =>
  (view !== "general" && e.views?.[view]) || e.highlights;

export const skillsFor = (e: Experience, view: View) =>
  (view !== "general" && e.skillsByView?.[view]) || e.skills;

export const allBullets = (e: Experience) => [...e.highlights, ...Object.values(e.views ?? {}).flat()];

export const experiences: Experience[] = [
  {
    id: "qualcomm",
    role: "AI Software Intern",
    company: "Qualcomm",
    location: "San Diego, USA",
    period: "Summer 2026",
    type: "Internship",
    highlights: [
      "Worked on a heterogeneous on-device inference runtime that co-executes model workloads across the GPU and the Hexagon Tensor Processor (HTP) in one end-to-end pipeline.",
      "Wrote Python benchmarking and profiling harnesses that scored every change on latency before it shipped, and evaluation harnesses that compared GPU, HTP and CPU-baseline results.",
      "Reduced latency by tuning data movement and synchronization between backends under on-device memory and power limits.",
      "Worked on graph partitioning and cost-aware backend selection that routes operators to the faster accelerator, with C++ contributed to Qualcomm's ExecuTorch backend.",
    ],
    views: {
      software: [
        "Wrote Python benchmarking, profiling and evaluation harnesses that scored every change on latency and correctness across GPU, HTP and CPU backends before it shipped.",
        "Worked on a runtime that co-executes model workloads across the GPU and HTP in one end-to-end pipeline, including graph partitioning and cost-aware backend selection.",
        "Reduced latency by tuning data movement and synchronization between backends under memory and power limits.",
        "Contributed C++ to Qualcomm's ExecuTorch backend for graph partitioning.",
      ],
      ml: [
        "Worked on a heterogeneous inference runtime that co-executes model workloads across the GPU and HTP in one end-to-end pipeline.",
        "Worked on graph partitioning and cost-aware backend selection that routes operators to the faster accelerator.",
        "Reduced latency by tuning data movement and synchronization between backends under on-device memory and power limits.",
        "Built Python benchmarking and evaluation harnesses that scored every change on latency and compared GPU, HTP and CPU-baseline results.",
      ],
    },
    skills: ["Python", "C++", "ExecuTorch", "ONNX Runtime", "GPU", "HTP", "Profiling"],
    skillsByView: { software: ["Python", "C++", "Benchmarking", "Profiling"] },
  },
  {
    id: "enphase",
    role: "Software Engineer",
    company: "Enphase Energy",
    location: "Bangalore, India",
    period: "Jul 2023 - Jul 2025",
    type: "Full-time",
    highlights: [
      "Built the full software stack for a new metering device from scratch, from the OS up to the application that sends data across a device network. Shipped to deployed hardware.",
      "Cut RAM from 98% to 82% and storage by 20% across a deployed fleet by redesigning data flow and memory layout: in-place processing, flat arrays, stale-entry eviction and tighter Protobuf layouts.",
      "Handled unreliable wireless links with retries, acknowledgements and bounded buffers, and fragmented messages to fit small frames.",
      "Maintained multithreaded C/C++ services for battery and microinverter products, with priority-based scheduling, mutexes and message queues.",
    ],
    views: {
      software: [
        "Built the full software stack for a new metering device from scratch and shipped it to deployed hardware.",
        "Handled unreliable links with retries, acknowledgements and bounded buffers, and fragmented messages to fit small frames.",
        "Maintained multithreaded C/C++ services with priority-based scheduling, mutexes and message queues across several product generations.",
        "Cut RAM from 98% to 82% and storage by 20% across a deployed fleet by redesigning data flow and memory layout.",
      ],
      ml: [
        "Built the full software stack for a new metering device from scratch and shipped it to deployed hardware.",
        "Cut RAM from 98% to 82% and storage by 20% across a deployed fleet by redesigning data flow and memory layout.",
        "Maintained multithreaded C/C++ services with priority-based scheduling, mutexes and message queues.",
      ],
    },
    skills: ["C", "C++", "Zigbee", "CAN", "Protobuf", "Zephyr"],
    skillsByView: { ml: ["C", "C++", "Multithreading"] },
  },
  {
    id: "visa",
    role: "Software Intern",
    company: "Visa Inc.",
    location: "Bangalore, India",
    period: "May 2022 - Jul 2022",
    type: "Internship",
    highlights: [
      "Built sub-10 ms ML scoring for transaction risk in a production pipeline handling millions of transactions daily, with monitoring, guardrails and safe fallbacks.",
      "Hit the budget with real-time-only features, precomputed normalization constants and lightweight tree-based models, after profiling every stage of the request path.",
      "Wrote Go and Java microservices that automated model onboarding, saving 2 weeks of engineering time per model configuration.",
      "Centralized alert and model config from scattered YAML files into one MySQL database with a normalized schema.",
    ],
    views: {
      software: [
        "Wrote Go and Java microservices that automated model onboarding, saving 2 weeks of engineering time per model configuration.",
        "Centralized alert and model config from scattered YAML files into one MySQL database with a normalized schema.",
        "Built sub-10 ms ML scoring for transaction risk in a production pipeline handling millions of transactions daily, with monitoring, guardrails and safe fallbacks.",
        "Profiled every stage of the request path (network, deserialization, features, inference, serialization) to stay inside the latency budget.",
      ],
      ml: [
        "Built sub-10 ms ML scoring for transaction risk in a production pipeline handling millions of transactions daily, with monitoring, guardrails and safe fallbacks.",
        "Hit the budget with real-time-only features, precomputed normalization constants and lightweight tree-based models, after profiling every stage of the request path.",
        "Wrote Go and Java microservices that automated model onboarding, saving 2 weeks of engineering time per model configuration.",
      ],
    },
    skills: ["Go", "Java", "Python", "Kafka", "Spark", "Hadoop", "MySQL"],
    skillsByView: { ml: ["Python", "Go", "Java", "Spark", "Kafka"] },
  },
  {
    id: "oqlo",
    role: "Cloud Intern",
    company: "Oqlo.ai (3rdi Corp)",
    location: "California, USA (remote)",
    period: "Jun 2021 - Dec 2021",
    type: "Internship",
    highlights: [
      "Built backend automation for a mobile device management product, delivering commands to devices over Firebase Cloud Messaging.",
      "Implemented AES-256 encryption for data at rest on AWS S3 and in transit over HTTPS/TLS, with SHA-256 and HMAC checks on data streams.",
      "Designed dynamic scaling with AWS Auto Scaling and an Azure Load Balancer, plus queues, connection pooling and database sharding to hold real-time performance at peak demand.",
    ],
    skills: ["AWS", "Azure", "Firebase", "AES-256", "HMAC", "SHA-256"],
  },
];
