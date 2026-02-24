"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { skillCategories } from "@/data/skills";
import { Container } from "@/components/SectionWrapper";

export default function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="skills" ref={ref} style={{ paddingTop: "10rem", paddingBottom: "10rem", position: "relative" }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-600/6 rounded-full blur-[160px]" />
      </div>

      <Container>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "5rem" }}
        >
          <span className="text-indigo-400 font-mono text-sm tracking-widest uppercase">Toolkit</span>
          <h2 style={{ marginTop: "1rem", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, color: "white", lineHeight: 1.1 }}>Skills</h2>
          <p style={{ marginTop: "1.25rem", color: "#94a3b8", fontSize: "1.1rem", lineHeight: 1.8, maxWidth: "36rem", marginLeft: "auto", marginRight: "auto" }}>
            Across the full spectrum — bare metal to browser, model training to production.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: "2rem" }}>
          {skillCategories.map((cat, i) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.1 }}
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
              <div className={`bg-gradient-to-r ${cat.color}`} style={{ height: "3px" }} />
              <div style={{ padding: "2.5rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "1.25rem" }}>{cat.icon}</div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", marginBottom: "1.75rem" }}>{cat.category}</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem" }}>
                  {cat.skills.map((skill, j) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={inView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.3, delay: 0.2 + i * 0.1 + j * 0.03 }}
                      style={{
                        padding: "0.5rem 0.875rem",
                        borderRadius: "0.5rem",
                        fontSize: "0.8rem",
                        fontFamily: "monospace",
                        color: "#cbd5e1",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.04)",
                        cursor: "default",
                      }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
