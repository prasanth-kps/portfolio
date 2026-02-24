"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Container } from "@/components/SectionWrapper";

const education = [
  {
    degree: "Master of Science",
    field: "Computer Science",
    institution: "University of Wisconsin-Madison",
    location: "Madison, USA",
    period: "Sep 2025 – May 2027",
    courses: ["Operating Systems", "High Performance Computing", "Database Management Systems", "Big Data Systems", "Machine Learning"],
    roles: ["Graduate Teaching Assistant — CS 640: Computer Networks"],
    gradient: "from-red-500 to-orange-600",
    accentColor: "#ef4444",
    logo: "UW",
  },
  {
    degree: "Dual Degree — B.Tech (Hons.) + M.Tech",
    field: "Electronics & Electrical Communication Engineering",
    institution: "IIT Kharagpur",
    location: "Kharagpur, India",
    period: "Jul 2018 – May 2023",
    courses: ["Data Structures & Object Representation", "ML / AI", "Digital Image Processing", "Computer Networks", "Embedded Systems Design", "Knowledge Modelling & Semantic Technologies"],
    roles: [
      "Teaching Assistant — Image and Video Processing",
      "Teaching Assistant — Embedded Systems Design",
      "M.Tech Thesis: Whispered Speech Enhancement (12.24% WER) — Presented at Empower 2025",
    ],
    gradient: "from-sky-500 to-indigo-600",
    accentColor: "#0ea5e9",
    logo: "IIT",
  },
];

export default function Education() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="education" ref={ref} style={{ paddingTop: "10rem", paddingBottom: "10rem", position: "relative" }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[500px] bg-sky-600/6 rounded-full blur-[160px]" />
      </div>

      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "5rem" }}
        >
          <span className="text-indigo-400 font-mono text-sm tracking-widest uppercase">Background</span>
          <h2 style={{ marginTop: "1rem", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, color: "white", lineHeight: 1.1 }}>
            Education
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))", gap: "2.5rem" }}>
          {education.map((edu, i) => (
            <motion.div
              key={edu.institution}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.15 }}
              className="group"
              style={{
                position: "relative",
                borderRadius: "1.5rem",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(5px)",
                WebkitBackdropFilter: "blur(5px)",
                overflow: "hidden",
                transition: "all 0.3s",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Top gradient bar */}
              <div className={`bg-gradient-to-r ${edu.gradient}`} style={{ height: "6px", flexShrink: 0 }} />

              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at top, ${edu.accentColor}12, transparent 65%)` }}
              />

              <div style={{ padding: "2.75rem", display: "flex", flexDirection: "column", flex: 1 }}>
                {/* Logo + institution header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "2.25rem" }}>
                  <div>
                    <div
                      className={`bg-gradient-to-br ${edu.gradient}`}
                      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "3.5rem", height: "3.5rem", borderRadius: "0.875rem", color: "white", fontSize: "0.9rem", fontWeight: 900, marginBottom: "1.25rem" }}
                    >
                      {edu.logo}
                    </div>
                    <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: "white", lineHeight: 1.3 }}>{edu.institution}</h3>
                    <p style={{ color: "#94a3b8", marginTop: "0.4rem", fontSize: "0.95rem" }}>{edu.location}</p>
                  </div>
                  <span style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "#64748b", flexShrink: 0, textAlign: "right", marginTop: "0.25rem" }}>{edu.period}</span>
                </div>

                {/* Degree */}
                <div style={{ marginBottom: "2.25rem", paddingBottom: "2.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "white", lineHeight: 1.4 }}>{edu.degree}</div>
                  <div style={{ fontSize: "0.95rem", marginTop: "0.5rem", fontWeight: 500, color: edu.accentColor }}>{edu.field}</div>
                </div>

                {/* Roles */}
                <div style={{ marginBottom: "2.25rem", flex: 1 }}>
                  {edu.roles.map((role, j) => (
                    <div key={j} style={{ display: "flex", gap: "0.875rem", color: "#cbd5e1", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: j < edu.roles.length - 1 ? "1rem" : 0 }}>
                      <span style={{ marginTop: "0.55rem", width: "0.375rem", height: "0.375rem", borderRadius: "50%", flexShrink: 0, backgroundColor: edu.accentColor }} />
                      {role}
                    </div>
                  ))}
                </div>

                {/* Courses */}
                <div>
                  <div style={{ fontSize: "0.7rem", fontFamily: "monospace", color: "#475569", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.875rem" }}>Coursework</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem" }}>
                    {edu.courses.map((c) => (
                      <span
                        key={c}
                        style={{ padding: "0.4rem 0.875rem", borderRadius: "0.5rem", fontSize: "0.75rem", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
