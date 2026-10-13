export interface SkillCategory {
  category: string;
  note: string;
  skills: string[];
  // Skills left out of the Software or ML view.
  hide?: Partial<Record<"software" | "ml", string[]>>;
}

export const skillCategories: SkillCategory[] = [
  {
    category: "Systems Programming",
    note: "Where most of my production hours went.",
    skills: ["C", "C++", "Linux/UNIX", "Multithreading", "RTOS", "Mbed OS", "Zephyr", "CAN", "Zigbee", "Protobuf"],
    hide: { ml: ["RTOS", "Mbed OS", "Zephyr", "CAN", "Zigbee", "Protobuf"] },
  },
  {
    category: "AI & Machine Learning",
    note: "Training, serving and running models on-device.",
    skills: ["PyTorch", "TensorFlow", "Keras", "scikit-learn", "ONNX Runtime", "ExecuTorch", "QNN", "CNN", "Bi-LSTM", "TabNet", "CLIP", "YOLO", "Whisper", "sentence-transformers", "RAG"],
  },
  {
    category: "HPC & Performance",
    note: "Making it fast, then measuring it.",
    skills: ["MPI", "OpenMP", "CUDA", "SIMD", "Slurm", "Nsight", "perf", "VTune", "gprof", "Benchmarking", "Profiling"],
  },
  {
    category: "Backend & Cloud",
    note: "Services, streams and the infrastructure under them.",
    skills: ["Python", "Go", "Java", "Kafka", "Spark", "Hadoop", "MySQL", "SQLite", "gRPC", "REST APIs", "AWS", "Azure", "Docker", "Firebase", "AES-256", "HMAC"],
    hide: { ml: ["REST APIs", "Firebase", "AES-256", "HMAC"] },
  },
  {
    category: "Web & Frontend",
    note: "Enough to ship the interface for what I build.",
    skills: ["React", "TypeScript", "JavaScript", "Vite", "Tailwind CSS", "Web Audio API", "Transformers.js", "WebSockets", "Streamlit", "Folium", "Playwright", "HTML/CSS", "PHP", "WordPress"],
    hide: { software: ["Transformers.js", "Streamlit", "Folium"] },
  },
  {
    category: "Data & Research",
    note: "Analysis, signals and speech.",
    skills: ["Pandas", "NumPy", "Matplotlib", "OpenCV", "MATLAB", "FFT", "Signal processing", "Speech processing", "RDF / SPARQL"],
  },
];
