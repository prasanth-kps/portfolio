"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { experiences } from "@/data/experience";
import { Container } from "@/components/SectionWrapper";

export default function Experience() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="experience" ref={ref} style={{ paddingTop: "10rem", paddingBottom: "10rem" }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ position: "absolute" }}>
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-indigo-600/7 rounded-full blur-[140px]" />
      </div>

      <Container>
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "5rem" }}
        >
          <span className="text-indigo-400 font-mono text-sm tracking-widest uppercase">Career</span>
          <h2 style={{ marginTop: "1rem", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, color: "white", lineHeight: 1.1 }}>
            Experience
          </h2>
          <p style={{ marginTop: "1.25rem", color: "#94a3b8", fontSize: "1.2rem", lineHeight: 1.8, maxWidth: "40rem", marginLeft: "auto", marginRight: "auto" }}>
            From embedded systems firmware to cloud microservices — across energy, fintech, and SaaS.
          </p>
        </motion.div>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.company}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
            >
              <div
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
                }}
              >
                {/* Accent left bar */}
                <div style={{ position: "absolute", left: 0, top: "2.5rem", bottom: "2.5rem", width: "4px", borderRadius: "0 4px 4px 0", backgroundColor: exp.accentColor }} />

                {/* Hover glow overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at top left, ${exp.accentColor}10, transparent 65%)` }}
                />

                <div style={{ padding: "3rem 3rem 3rem 3.5rem" }}>
                  {/* Header */}
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "2rem" }}>
                    <div>
                      <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", marginBottom: "0.6rem" }}>{exp.role}</h3>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontSize: "1.2rem", fontWeight: 600, color: exp.accentColor }}>{exp.company}</span>
                        <span style={{ color: "#334155" }}>·</span>
                        <span style={{ color: "#94a3b8", fontSize: "0.95rem" }}>{exp.location}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={{ display: "inline-block", padding: "0.4rem 1rem", borderRadius: "999px", border: `1px solid ${exp.accentColor}40`, color: exp.accentColor, backgroundColor: `${exp.accentColor}15`, fontSize: "0.75rem", fontFamily: "monospace" }}>
                        {exp.type}
                      </span>
                      <div style={{ marginTop: "0.6rem", color: "#64748b", fontSize: "0.875rem", fontFamily: "monospace" }}>{exp.period}</div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: "2rem" }} />

                  {/* Highlights */}
                  <ul style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2.5rem" }}>
                    {exp.highlights.map((h, j) => (
                      <li key={j} style={{ display: "flex", gap: "1rem", color: "#cbd5e1", fontSize: "1rem", lineHeight: 1.7 }}>
                        <span style={{ marginTop: "0.55rem", width: "0.4rem", height: "0.4rem", borderRadius: "50%", flexShrink: 0, backgroundColor: exp.accentColor }} />
                        {h}
                      </li>
                    ))}
                  </ul>

                  {/* Skills */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                    {exp.skills.map((skill) => (
                      <span
                        key={skill}
                        style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", fontSize: "0.8rem", fontFamily: "monospace", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
                      >
                        {skill}
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
