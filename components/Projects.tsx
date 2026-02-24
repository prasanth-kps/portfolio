"use client";
import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { projects } from "@/data/projects";
import { Container } from "@/components/SectionWrapper";

export default function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section id="projects" style={{ paddingTop: "10rem", paddingBottom: "10rem", position: "relative" }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[700px] h-[500px] bg-violet-700/8 rounded-full blur-[160px]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-600/8 rounded-full blur-[140px]" />
      </div>

      <Container ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "5rem" }}
        >
          <span className="text-indigo-400 font-mono text-sm tracking-widest uppercase">Portfolio</span>
          <h2 style={{ marginTop: "1rem", fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, color: "white", lineHeight: 1.1 }}>Selected Projects</h2>
          <p style={{ marginTop: "1.25rem", color: "#94a3b8", fontSize: "1.1rem", lineHeight: 1.8, maxWidth: "36rem", marginLeft: "auto", marginRight: "auto" }}>
            Click any card to expand the full story behind each project.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))", gap: "2.5rem" }}>
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.1 }}
              layout
            >
              <div
                onClick={() => setExpanded(expanded === project.id ? null : project.id)}
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
                  cursor: "pointer",
                  height: "100%",
                }}
              >
                <div className={`bg-gradient-to-r ${project.gradient}`} style={{ height: "6px" }} />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at top left, ${project.accentColor}15, transparent 60%)` }}
                />

                <div style={{ padding: "2.75rem", position: "relative" }}>
                  {/* Title */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <div style={{ flex: 1, minWidth: 0, marginRight: "1rem" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                        <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", letterSpacing: "-0.02em" }}>{project.title}</h3>
                        {project.demo && (
                          <span style={{ padding: "0.3rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontFamily: "monospace", background: "rgba(20,184,166,0.15)", color: "#2dd4bf", border: "1px solid rgba(20,184,166,0.25)", flexShrink: 0 }}>
                            Live ↗
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "0.95rem", fontWeight: 500, color: project.accentColor }}>{project.subtitle}</p>
                    </div>
                    <motion.div
                      animate={{ rotate: expanded === project.id ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ width: "2.25rem", height: "2.25rem", flexShrink: 0, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "1.25rem", marginTop: "0.25rem" }}
                    >
                      +
                    </motion.div>
                  </div>

                  {/* Description */}
                  <p style={{ color: "#94a3b8", fontSize: "1rem", lineHeight: 1.8, marginBottom: "2rem" }}>{project.description}</p>

                  {/* Expanded */}
                  <AnimatePresence initial={false}>
                    {expanded === project.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{ paddingTop: "1.5rem", paddingBottom: "1rem", borderTop: "1px solid rgba(255,255,255,0.08)", marginBottom: "2rem" }}>
                          <p style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: 1.9 }}>{project.longDescription}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Highlight badge */}
                  {project.highlight && (
                    <div
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1.125rem", borderRadius: "999px", fontSize: "0.75rem", fontFamily: "monospace", marginBottom: "1.75rem", backgroundColor: `${project.accentColor}15`, color: project.accentColor, border: `1px solid ${project.accentColor}30` }}
                    >
                      <span style={{ width: "0.375rem", height: "0.375rem", borderRadius: "50%", backgroundColor: project.accentColor }} />
                      {project.highlight}
                    </div>
                  )}

                  {/* Tags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem", marginBottom: "2.25rem" }}>
                    {project.tags.map((tag) => (
                      <span key={tag} style={{ padding: "0.4rem 0.875rem", borderRadius: "0.5rem", fontSize: "0.78rem", fontFamily: "monospace", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div style={{ display: "flex", gap: "0.875rem" }} onClick={(e) => e.stopPropagation()}>
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", borderRadius: "0.75rem", fontSize: "0.875rem", fontWeight: 500, border: "1px solid rgba(255,255,255,0.12)", color: "#cbd5e1", textDecoration: "none", transition: "all 0.2s" }}
                    >
                      <GitHubIcon size={14} /> GitHub
                    </a>
                    {project.demo && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", borderRadius: "0.75rem", fontSize: "0.875rem", fontWeight: 500, textDecoration: "none", transition: "all 0.2s", backgroundColor: `${project.accentColor}20`, color: project.accentColor, border: `1px solid ${project.accentColor}35` }}
                      >
                        Live Demo ↗
                      </a>
                    )}
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

function GitHubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  );
}
