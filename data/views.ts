export type View = "general" | "software" | "ml";

export const views: { id: View; label: string }[] = [
  { id: "general", label: "General" },
  { id: "software", label: "Software" },
  { id: "ml", label: "ML" },
];

export interface HeadlineWord {
  text: string;
  accent?: boolean;
}

export interface ViewCopy {
  eyebrow: string;
  headline: HeadlineWord[][];
  sub: string;
  layers: string[];
  defaultLayer: number;
  achievements: string[];
  // Words in [brackets] are highlighted.
  about: string;
  facts: { figure: string; text: string }[];
  experienceBlurb: string;
  experienceOrder: string[];
  projectOrder: string[];
  labOrder: string[];
  skillOrder: string[];
  contactLine: string;
}

export const copy: Record<View, ViewCopy> = {
  general: {
    eyebrow: "Prasanth Kasa. Software & ML engineer.",
    headline: [
      [{ text: "Software" }, { text: "from" }, { text: "the" }, { text: "OS", accent: true }],
      [{ text: "to" }, { text: "the" }, { text: "model.", accent: true }],
    ],
    sub: "MS CS at UW-Madison. Two years of production C/C++ at Enphase, then on-device ML inference at Qualcomm.",
    layers: ["models", "runtime", "services", "cloud", "networking", "systems"],
    defaultLayer: 0,
    achievements: ["jee-mains", "jee-adv", "gate", "empower"],
    about:
      "I started in [low-level systems], where one wasted byte matters. Now I bring that discipline to [machine learning]: models that run on-device, stay fast, and never need the cloud.",
    facts: [
      { figure: "2 yrs", text: "Production C/C++ at Enphase Energy" },
      { figure: "98% to 82%", text: "RAM on a deployed device fleet after a data-flow redesign" },
      { figure: "10 ms", text: "Budget for ML risk scoring in Visa's transaction pipeline" },
    ],
    experienceBlurb:
      "Two years of full-time engineering at Enphase, plus internships in on-device inference, fraud infrastructure and device cloud.",
    experienceOrder: ["qualcomm", "enphase", "visa", "oqlo"],
    projectOrder: ["aura", "nofi", "vecscale", "disaster-response", "rpm", "crawler"],
    labOrder: ["link", "budget", "ram", "vector", "allocator"],
    skillOrder: ["Systems Programming", "AI & Machine Learning", "HPC & Performance", "Backend & Cloud", "Web & Frontend", "Data & Research"],
    contactLine: "Open to software and ML roles from June 2027",
  },
  software: {
    eyebrow: "Prasanth Kasa. Software engineer.",
    headline: [
      [{ text: "Backend", accent: true }, { text: "and" }, { text: "systems" }, { text: "software," }],
      [{ text: "built" }, { text: "to" }, { text: "ship.", accent: true }],
    ],
    sub: "MS CS at UW-Madison. Two years of production C/C++, Go and Java services, and cloud systems on AWS and Azure.",
    layers: ["runtime", "services", "cloud", "networking", "systems"],
    defaultLayer: 1,
    achievements: ["jee-mains", "jee-adv", "gate"],
    about:
      "I build software that has to keep working: [services], [concurrency] and the data paths between them. I care about latency, failure modes, and the next person reading the code.",
    facts: [
      { figure: "2 yrs", text: "Production C/C++ at Enphase Energy" },
      { figure: "2 weeks", text: "Engineering time saved per model by automating onboarding at Visa" },
      { figure: "98% to 82%", text: "RAM on a deployed device fleet after a data-flow redesign" },
    ],
    experienceBlurb:
      "Two years of production engineering, plus internships in backend services, cloud and inference tooling.",
    experienceOrder: ["enphase", "qualcomm", "visa", "oqlo"],
    projectOrder: ["nofi", "crawler", "vecscale", "rpm"],
    labOrder: ["link", "budget", "ram", "vector"],
    skillOrder: ["Backend & Cloud", "Systems Programming", "Web & Frontend", "HPC & Performance"],
    contactLine: "Open to software engineering roles from June 2027",
  },
  ml: {
    eyebrow: "Prasanth Kasa. ML engineer.",
    headline: [
      [{ text: "ML", accent: true }, { text: "systems" }, { text: "that" }, { text: "run" }],
      [{ text: "where" }, { text: "the" }, { text: "data", accent: true }, { text: "is." }],
    ],
    sub: "MS CS at UW-Madison. On-device inference at Qualcomm, sub-10 ms ML scoring at Visa, and vision, speech and retrieval projects.",
    layers: ["models", "runtime", "services", "systems"],
    defaultLayer: 0,
    achievements: ["jee-mains", "jee-adv", "gate", "empower"],
    about:
      "I build ML where it actually runs: [on-device inference], [retrieval] and [speech and vision models], profiled against real latency, memory and power limits.",
    facts: [
      { figure: "10 ms", text: "Budget for ML risk scoring in Visa's transaction pipeline" },
      { figure: "GPU + HTP", text: "Co-executed in one on-device inference pipeline at Qualcomm" },
      { figure: "12.24%", text: "Word error rate on my whispered-speech thesis" },
    ],
    experienceBlurb:
      "On-device inference at Qualcomm, ML scoring at Visa, and two years of production systems work before that.",
    experienceOrder: ["qualcomm", "visa", "enphase"],
    projectOrder: ["aura", "vecscale", "disaster-response", "nofi"],
    labOrder: ["vector", "allocator", "budget"],
    skillOrder: ["AI & Machine Learning", "HPC & Performance", "Data & Research", "Backend & Cloud", "Systems Programming"],
    contactLine: "Open to ML engineering roles from June 2027",
  },
};
