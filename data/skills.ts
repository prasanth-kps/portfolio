export interface SkillCategory {
  category: string;
  icon: string;
  color: string;
  skills: string[];
}

export const skillCategories: SkillCategory[] = [
  {
    category: "Systems & Embedded",
    icon: "⚙️",
    color: "from-orange-500 to-red-600",
    skills: ["C", "C++", "Mbed OS", "Zephyr OS", "CAN Bus", "Zigbee", "Protobuf", "RTOS", "Bootloader"],
  },
  {
    category: "AI & Machine Learning",
    icon: "🧠",
    color: "from-violet-500 to-purple-700",
    skills: ["PyTorch", "TensorFlow", "Keras", "CNN", "TabNet", "Whisper", "CLIP", "BLIP", "YOLOv11", "Transformers", "Scikit-learn"],
  },
  {
    category: "Backend & Cloud",
    icon: "☁️",
    color: "from-blue-500 to-cyan-600",
    skills: ["Python", "Go", "Java", "Flask", "AWS", "Azure", "Firebase", "Docker", "Kafka", "Hadoop", "Spark", "MySQL"],
  },
  {
    category: "Frontend & Web",
    icon: "🎨",
    color: "from-teal-500 to-green-600",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Web Audio API", "Streamlit", "HTML5", "CSS3", "Vite"],
  },
  {
    category: "Data & Research",
    icon: "📊",
    color: "from-pink-500 to-rose-600",
    skills: ["Pandas", "NumPy", "Matplotlib", "Plotly", "OpenCV", "MATLAB", "Jupyter", "FSK / Signal Processing"],
  },
];
