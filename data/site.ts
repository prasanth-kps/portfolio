export const site = {
  name: "Prasanth Kasa",
  email: "pkasa@wisc.edu",
  github: "https://github.com/prasanth-kps",
  linkedin: "https://www.linkedin.com/in/penchala-siva-prasanth-kasa-525280216/",
  resume: "/resume.pdf",
};

export interface Layer {
  id: string;
  name: string;
  where: string;
  detail: string;
  tech: string;
}

// Top of the stack first. Drives the interactive panel in the hero.
export const layers: Layer[] = [
  {
    id: "models",
    name: "Models",
    where: "AURA, NoFi",
    detail: "Vision, speech and retrieval models, built and run on-device.",
    tech: "ONNX Runtime, CLIP, YOLO, Whisper",
  },
  {
    id: "runtime",
    name: "Runtime",
    where: "Qualcomm",
    detail: "An inference runtime that co-executes models across GPU and HTP, with graph partitioning and cost-aware routing.",
    tech: "ExecuTorch, C++, Python",
  },
  {
    id: "services",
    name: "Services",
    where: "Visa",
    detail: "Go and Java microservices over Kafka. ML risk scoring inside a 10 ms budget.",
    tech: "Go, Java, Kafka, Spark, MySQL",
  },
  {
    id: "cloud",
    name: "Cloud",
    where: "Oqlo.ai",
    detail: "Autoscaling, queue-based sharding and AES-256 encryption for a device fleet.",
    tech: "AWS, Azure, Firebase, SQS",
  },
  {
    id: "networking",
    name: "Networking",
    where: "Enphase",
    detail: "Zigbee and CAN links with Protobuf, with retries and bounded buffers for unreliable networks.",
    tech: "Zigbee, CAN, Protobuf",
  },
  {
    id: "systems",
    name: "Systems",
    where: "Enphase",
    detail: "Multithreaded C/C++ on a real-time OS. RAM cut from 98% to 82% across a deployed fleet.",
    tech: "C, C++, Mbed OS, Zephyr",
  },
];

export interface Achievement {
  id: string;
  figure: string;
  title: string;
  note: string;
}

export const achievements: Achievement[] = [
  { id: "jee-mains", figure: "23", title: "IIT JEE Mains 2018", note: "Nationally ranked 23 among 125,000 candidates in Paper-II. Top 0.018%." },
  { id: "jee-adv", figure: "1318", title: "IIT JEE Advanced 2018", note: "Nationally ranked among 230,000 candidates. Top 0.5%." },
  { id: "gate", figure: "1250", title: "GATE 2022", note: "Nationally ranked in the Graduate Aptitude Test in Engineering. Top 1%." },
  { id: "empower", figure: "2025", title: "Empower 2025", note: "Presented my dual-degree thesis on whispered speech to natural speech." },
];

export interface Education {
  school: string;
  degree: string;
  field: string;
  place: string;
  period: string;
  courses: string[];
  extras: string[];
  // Tailored course and extras lists for the Software and ML views.
  views?: Partial<Record<"software" | "ml", { courses?: string[]; extras?: string[] }>>;
}

export const education: Education[] = [
  {
    school: "University of Wisconsin-Madison",
    degree: "M.S. Computer Science",
    field: "School of Computer, Data & Information Sciences",
    place: "Madison, USA",
    period: "Sep 2025 - May 2027",
    courses: [
      "Operating Systems",
      "High Performance Computing",
      "Databases",
      "Big Data Systems",
      "Machine Learning",
      "Computer Vision",
      "AI Agents",
    ],
    extras: [
      "Graduate Teaching Assistant and Peer Mentor, CS 640 Computer Networks (Spring 2026). Supported 3 sections and 200+ students with 6+ hours of office hours a week.",
    ],
    views: {
      software: { courses: ["Operating Systems", "High Performance Computing", "Databases", "Big Data Systems"] },
      ml: {
        courses: ["Machine Learning", "Computer Vision", "AI Agents", "High Performance Computing", "Big Data Systems", "Databases", "Operating Systems"],
      },
    },
  },
  {
    school: "IIT Kharagpur",
    degree: "B.Tech (Hons.) + M.Tech dual degree",
    field: "Electronics & Electrical Communication Engineering",
    place: "Kharagpur, India",
    period: "Jul 2018 - May 2023",
    courses: [
      "Data Structures & Algorithms",
      "Machine Learning",
      "Digital Image Processing",
      "Computer Networks",
      "Embedded Systems Design",
      "Digital Signal Processing",
    ],
    extras: [
      "Dual-degree thesis on converting whispered speech into natural speech. 12.24% word error rate. Presented at Empower 2025.",
      "Teaching Assistant for Image & Video Processing (Autumn 2022) and Embedded Systems Design (Spring 2023).",
    ],
    views: {
      software: { courses: ["Data Structures & Algorithms", "Computer Networks", "Digital Signal Processing"], extras: [] },
      ml: {
        courses: ["Machine Learning", "Digital Image Processing", "Digital Signal Processing", "Data Structures & Algorithms"],
        extras: [
          "Dual-degree thesis on converting whispered speech into natural speech. 12.24% word error rate. Presented at Empower 2025.",
          "Teaching Assistant for Image & Video Processing (Autumn 2022).",
        ],
      },
    },
  },
];
