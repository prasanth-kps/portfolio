export interface Experience {
  role: string;
  company: string;
  location: string;
  period: string;
  type: string;
  highlights: string[];
  skills: string[];
  accentColor: string;
}

export const experiences: Experience[] = [
  {
    role: "Software Engineer",
    company: "Enphase Energy",
    location: "Bangalore, India",
    period: "Jul 2023 – Jul 2025",
    type: "Full-time",
    highlights: [
      "Developed the complete software stack from scratch for a new metering device — OS bootstrapping through all application-level code for reliable data transmission",
      "Reduced RAM usage from 98% → 82% and cut storage by 20% by redesigning the full data propagation flow between Enphase devices",
      "Maintained and developed C/C++ software for Bootloader, Battery, and Micro-inverters — optimizing multi-threaded processes with Protobuf for inter-device communication",
    ],
    skills: ["C", "C++", "CAN", "Zigbee", "Protobuf", "Mbed OS", "Zephyr OS"],
    accentColor: "#f97316",
  },
  {
    role: "Software Intern",
    company: "Visa Inc.",
    location: "Bangalore, India",
    period: "May 2022 – Jul 2022",
    type: "Internship",
    highlights: [
      "Built predictive models to assess transaction risk within 10ms, enabling real-time fraud detection at scale",
      "Developed microservices in Go and Java to automate model onboarding, saving 2 weeks of man-hours per configuration",
      "Migrated alert and model data from distributed YAML files across multiple services to a centralized MySQL database",
    ],
    skills: ["Go", "Java", "Python", "Spark", "Hadoop", "Kafka", "MySQL"],
    accentColor: "#3b82f6",
  },
  {
    role: "Cloud Intern",
    company: "3rdi Corp — Oqlo.ai",
    location: "California, USA (Remote)",
    period: "Jun 2021 – Dec 2021",
    type: "Internship",
    highlights: [
      "Contributed to the OQLO Mobile Management solution using Firebase Cloud Messaging",
      "Implemented end-to-end AES-256 encryption for data at rest (AWS S3) and in transit over HTTPS/SSL",
      "Designed dynamic scaling with AWS Auto Scaling and Azure Load Balancer, combined with queue-based sharding for real-time peak performance",
    ],
    skills: ["AWS", "Azure", "Firebase", "AES-256", "HTTPS/SSL"],
    accentColor: "#8b5cf6",
  },
];
