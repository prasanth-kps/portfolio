export interface FlowNode {
  label: string;
  note: string;
}

const n = (label: string, note: string): FlowNode => ({ label, note });

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  github: string | null;
  demo: string | null;
  badge: string;
  // Architecture as rows of nodes, rendered as a typographic diagram.
  flow: FlowNode[][];
  // Tailored text for the Software and ML views.
  views?: Partial<Record<"software" | "ml", Partial<Pick<Project, "description" | "tags" | "badge">>>>;
}

export const projects: Project[] = [
  {
    id: "aura",
    title: "AURA",
    subtitle: "On-device assistant for smart glasses",
    description:
      "A proof of concept that runs vision, speech and language models entirely on-device, on Qualcomm Snapdragon hardware through ONNX Runtime and the QNN provider, with CPU fallback. Three lenses: face ID that learns names from audio, zero-shot scene captions, and an object memory you can query in plain English.",
    tags: ["Python", "ONNX Runtime", "QNN", "CLIP", "BLIP", "YOLO", "faster-whisper", "Ollama", "OpenCV", "Streamlit"],
    github: "https://github.com/prasanth-kps/aura",
    demo: null,
    badge: "Qualcomm hackathon, team of 4",
    flow: [
      [
        n("Camera", "Video frames from the glasses feed three perception lenses that run in parallel."),
        n("Face embeddings", "The Face ID lens turns each detected face into an embedding on the NPU."),
        n("Match", "Embeddings are compared against an enrolled database to recognize known faces."),
      ],
      [
        n("Mic", "When a face is unknown, audio from the conversation is captured."),
        n("faster-whisper", "Speech is transcribed locally with faster-whisper."),
        n("Local LLM", "A local LLM extracts the name from the introduction."),
        n("Enroll name", "The new face is enrolled under that name for next time."),
      ],
      [
        n("Camera", "The same frames feed the scene lens."),
        n("CLIP + BLIP", "CLIP classifies the scene zero-shot and BLIP writes a natural-language caption."),
        n("Scene caption", "The result is a plain-English description of what the camera sees."),
      ],
      [
        n("Camera", "And the object lens."),
        n("YOLO + tracking", "YOLO detects objects and tracks them across frames."),
        n("Object memory", "Sightings are remembered, so you can ask in plain English where something is."),
      ],
    ],
  },
  {
    id: "nofi",
    title: "NoFi",
    subtitle: "Offline audio mesh network",
    description:
      "Sends text and voice between devices over sound, with no network, server or Bluetooth. FSK encodes characters as tones, the receiver decodes them with an FFT, and devices relay messages to form a mesh. Whisper runs in the browser for voice to text. Measured about 6 characters per second over 3 to 10 m indoors, with 95%+ reliability in quiet rooms.",
    tags: ["React", "TypeScript", "Vite", "Tailwind CSS", "Web Audio API", "Transformers.js", "FSK"],
    github: "https://github.com/prasanth-kps/Nofi",
    demo: "https://no-fi.vercel.app",
    badge: "MadHacks 2025",
    views: {
      software: {
        description:
          "Sends text between devices over sound, with no network, server or Bluetooth. FSK encodes characters as tones, the receiver decodes them with an FFT and a state machine, and devices relay messages with unique IDs to form a mesh without loops. Measured about 6 characters per second over 3 to 10 m indoors, with 95%+ reliability in quiet rooms.",
        tags: ["React", "TypeScript", "Vite", "Tailwind CSS", "Web Audio API", "FSK", "Vercel"],
      },
      ml: {
        description:
          "Devices talk over sound with no network. FSK encodes text as tones, an FFT-based decoder turns them back into characters, and Whisper (tiny) runs locally in the browser through Transformers.js for offline voice to text.",
        tags: ["Whisper", "Transformers.js", "FFT", "FSK", "Web Audio API", "TypeScript"],
      },
    },
    flow: [],
  },
  {
    id: "vecscale",
    title: "VecScale",
    subtitle: "Distributed vector search in C++",
    description:
      "A distributed top-k vector search system. The corpus is sharded, parallel workers search their shards, and results merge into a global ranking scored against an exact baseline. Parallelized with MPI across nodes, OpenMP within nodes and CUDA for distance computation, with latency, throughput, recall@k and strong and weak scaling measured.",
    tags: ["C++", "MPI", "OpenMP", "CUDA", "SIMD", "Slurm", "CMake"],
    github: null,
    demo: null,
    badge: "HPC course project",
    flow: [
      [
        n("Corpus", "The vector dataset to search."),
        n("Shards", "The corpus is split into shards so workers can search in parallel."),
        n("Parallel workers", "Workers search their own shards at once, with MPI across nodes and OpenMP within a node."),
        n("Local top-k", "Each worker keeps its k nearest candidates. Distance computation is accelerated with SIMD and CUDA."),
      ],
      [
        n("Merge", "Local results from every worker are merged."),
        n("Global ranking", "The merged candidates become one global top-k ranking."),
        n("recall@k vs exact", "The ranking is scored against an exact baseline to measure recall@k, alongside latency and throughput."),
      ],
    ],
  },
  {
    id: "disaster-response",
    title: "Disaster Response Framework",
    subtitle: "Fault-tolerant ML resource allocator",
    description:
      "Ranks emergency requests by priority and allocates medical, food and rescue resources under strict latency goals. A hybrid 1D CNN and TabNet regressor produces the priority score, and a fault-tolerant manager redirects requests to the next nearest active center when nodes fail. Single-author paper.",
    tags: ["Python", "1D CNN", "TabNet", "WebSockets", "MQTT", "Streamlit", "Folium"],
    github: "https://github.com/prasanth-kps/disaster-response-framework",
    demo: "https://disaster-response-framework.streamlit.app",
    badge: "Single-author paper",
    flow: [
      [
        n("IoT + geo data", "Coordinates, IoT sensor readings and user-reported severities stream in over WebSockets and MQTT."),
        n("1D CNN (64-d)", "A 1D CNN condenses the preprocessed features into a 64-dimensional vector."),
        n("TabNet", "TabNet's attention weights the features that matter and predicts a priority score."),
      ],
      [
        n("Priority score", "Requests are ranked by priority so the most urgent are served first."),
        n("Allocator", "Medical, food and rescue resources are allocated under strict latency and availability goals."),
        n("Fallback", "A fault-tolerant manager detects failures or demand surges and redirects requests to the next nearest active center."),
      ],
    ],
  },
  {
    id: "rpm",
    title: "Remote Patient Monitoring",
    subtitle: "Three-tier cloud health system",
    description:
      "Wearable simulators stream vitals to a gateway, which feeds a medical center that classifies health status with K-star and ranks hospitals with AHP-VIKOR. Deployed with Docker Compose. IJIRCCE 2024.",
    tags: ["Python", "Flask", "SQLite", "Docker", "K-star", "AHP-VIKOR"],
    github: "https://github.com/prasanth-kps/remote-patient-monitoring",
    demo: "https://remote-patient-montioring.onrender.com",
    badge: "IJIRCCE 2024",
    views: {
      software: {
        description:
          "A three-tier cloud system: wearable simulators stream vitals to a gateway, which feeds a medical center with a real-time alert engine and hospital ranking. Deployed with Docker Compose and SQLite persistence. IJIRCCE 2024.",
        tags: ["Python", "Flask", "SQLite", "Docker"],
      },
    },
    flow: [
      [
        n("Wearables", "IoT simulators stream heart rate, blood pressure, SpO2, temperature and respiratory rate every 30 seconds."),
        n("Gateway", "The gateway normalizes the readings and forwards them."),
        n("Medical center", "The medical center classifies each patient's health status and raises alerts."),
        n("Hospital ranking", "Hospitals are ranked on multiple criteria so the best fit can be chosen."),
      ],
    ],
  },
  {
    id: "crawler",
    title: "Job Board Crawler",
    subtitle: "Nightly crawler and change detector",
    description:
      "Scans thousands of postings across 62 job boards every night and emails only the new matches. One scraper per source type behind a uniform record contract, including a headless browser for JavaScript pages. Idempotent re-runs through a UNIQUE URL constraint, and per-source failure isolation so one broken board never halts a run.",
    tags: ["Python", "requests", "BeautifulSoup", "Playwright", "SQLite", "launchd"],
    github: null,
    demo: null,
    badge: "In daily use",
    flow: [
      [
        n("62 boards", "35 Greenhouse boards, 18 Lever boards and 9 custom career pages."),
        n("Scrape", "One scraper per source type: JSON APIs, raw HTML, and a headless browser for JavaScript pages. Retries, jittered rate limits and timeouts isolate failures."),
        n("Normalize", "Different sources are normalized into one record contract and one SQL schema."),
        n("SQLite", "A UNIQUE URL constraint makes re-runs idempotent, so duplicates never accumulate."),
      ],
      [
        n("Detect changes", "Only new matches survive the title, location and recency filters."),
        n("Email digest", "A daily email digest, a location-filtered feed and a CSV export."),
      ],
    ],
  },
];

export const projectFor = (p: Project, view: "general" | "software" | "ml"): Project =>
  view === "general" ? p : { ...p, ...p.views?.[view] };
