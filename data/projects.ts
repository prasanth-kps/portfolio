export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  tags: string[];
  github: string;
  demo: string | null;
  highlight: string;
  gradient: string;
  accentColor: string;
}

export const projects: Project[] = [
  {
    id: "aura",
    title: "AURA",
    subtitle: "Augmented Understanding & Relational Archive",
    description:
      "On-device AI assistant for smart glasses — real-time face recognition, scene understanding, and spatial object memory. Three parallel perception lenses running entirely on-device via Qualcomm AI Hub NPU.",
    longDescription:
      "AURA processes video and audio in real time — recognizing faces, understanding scenes, and remembering objects — entirely on-device with no cloud dependency. The Face ID Lens matches faces against an enrolled database and uses Whisper + LLM to extract names from audio when a face is unknown. The Scene Insight Lens uses CLIP + BLIP for zero-shot scene classification and natural language captioning. The Find-My-Object Lens uses YOLOv11 to track objects across frames and lets users query memory in plain English.",
    tags: ["Python", "YOLOv11", "CLIP", "BLIP", "Whisper", "ONNX", "Streamlit", "Qualcomm AI Hub"],
    github: "https://github.com/prasanth-kps/aura",
    demo: null,
    highlight: "NPU-accelerated · Qualcomm Hackathon",
    gradient: "from-violet-600 via-purple-600 to-indigo-700",
    accentColor: "#8b5cf6",
  },
  {
    id: "nofi",
    title: "NoFi",
    subtitle: "Offline Audio Mesh Network",
    description:
      "Peer-to-peer communication over sound waves — no WiFi, no internet. FSK encodes text into audio tones; other devices decode via microphone + FFT. Includes mesh relay, near-ultrasonic stealth mode, and client-side Whisper AI.",
    longDescription:
      "NoFi uses Frequency Shift Keying (FSK) modulation to encode characters as distinct audio frequencies across 1.2–3 kHz (audible) or 16–20 kHz (near-ultrasonic stealth). Devices auto-relay received messages after a random 10–20s delay, forming an organic mesh. A state-machine receiver handles collision detection. Voice-to-text runs via whisper-tiny.en through Transformers.js — ~40MB one-time download, fully offline after.",
    tags: ["React", "TypeScript", "Web Audio API", "Transformers.js", "Vite", "FSK"],
    github: "https://github.com/prasanth-kps/Nofi",
    demo: "https://no-fi.vercel.app",
    highlight: "MADHACKS 2025 · UW Madison",
    gradient: "from-teal-500 via-cyan-600 to-sky-700",
    accentColor: "#14b8a6",
  },
  {
    id: "disaster-response",
    title: "Disaster Response Framework",
    subtitle: "Fault-Tolerant ML Resource Allocator",
    description:
      "CNN + TabNet pipeline predicts disaster severity from IoT/geospatial data and allocates resources in real-time by proximity and urgency. Built-in fault-tolerance with automatic fallback. Backed by published research.",
    longDescription:
      "The system integrates geospatial data and real-time IoT sensor inputs into a 1D CNN feature extractor that produces 64-dim representations, then feeds them to an attention-based TabNet regressor to predict priority scores. A fault-tolerant manager continuously monitors resource levels and activates fallback strategies. The interactive Streamlit dashboard provides geospatial maps, analytics, and live allocation controls.",
    tags: ["Python", "CNN", "TabNet", "Streamlit", "Folium", "Pandas", "MQTT", "WebSockets"],
    github: "https://github.com/prasanth-kps/disaster-response-framework",
    demo: "https://disaster-response-framework.streamlit.app",
    highlight: "",
    gradient: "from-orange-500 via-red-600 to-rose-700",
    accentColor: "#f97316",
  },
  {
    id: "rpm",
    title: "Remote Patient Monitoring",
    subtitle: "Distributed Cloud Health System",
    description:
      "Three-tier cloud RPM system: IoT wearable simulation → gateway aggregation → medical center with K-star health classification and AHP-VIKOR hospital ranking. IJIRCCE 2024 publication.",
    longDescription:
      "Tier 1 IoT simulators stream heart rate, blood pressure, SpO₂, temperature, and respiratory rate every 30s. Tier 2 gateway normalizes and forwards data. Tier 3 medical center runs K-star (KNN-based) classification across 6 health status codes and uses AHP-VIKOR multi-criteria decision making to rank hospitals. Full Docker Compose deployment with SQLite persistence and real-time alert engine.",
    tags: ["Python", "Flask", "SQLite", "Docker", "K-star", "AHP-VIKOR", "Folium"],
    github: "https://github.com/prasanth-kps/remote-patient-monitoring",
    demo: "https://remote-patient-montioring.onrender.com",
    highlight: "",
    gradient: "from-emerald-500 via-green-600 to-teal-700",
    accentColor: "#10b981",
  },
];
