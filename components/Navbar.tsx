"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (href: string) => {
    setActive(href);
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#050510]/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <motion.a
          href="#"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="text-white font-bold text-lg tracking-tight"
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-teal-400">
            PK
          </span>
          <span className="text-slate-400 text-sm font-normal ml-1 hidden sm:inline">/ Prasanth Kasa</span>
        </motion.a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center" style={{ gap: "0.25rem" }}>
          {links.map((link) => (
            <button
              key={link.href}
              onClick={() => handleClick(link.href)}
              style={{
                position: "relative",
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                borderRadius: "0.5rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: active === link.href ? "white" : "#94a3b8",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => { if (active !== link.href) (e.currentTarget as HTMLElement).style.color = "white"; }}
              onMouseLeave={(e) => { if (active !== link.href) (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}
            >
              {active === link.href && (
                <motion.span
                  layoutId="nav-pill"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "0.5rem",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
              )}
              <span style={{ position: "relative", zIndex: 10 }}>{link.label}</span>
            </button>
          ))}
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginLeft: "1rem",
              padding: "0.5rem 1.1rem",
              fontSize: "0.875rem",
              borderRadius: "0.5rem",
              background: "#4f46e5",
              color: "white",
              fontWeight: 500,
              textDecoration: "none",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#4338ca")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#4f46e5")}
          >
            Resume ↗
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white"
          aria-label="Menu"
        >
          <div className="w-5 h-4 flex flex-col justify-between">
            <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 bg-current transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[9px]" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-[#050510]/95 backdrop-blur-xl border-b border-white/5"
          >
            <div className="px-6 py-4 flex flex-col gap-2">
              {links.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleClick(link.href)}
                  className="text-left px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 px-4 py-3 text-center rounded-lg bg-indigo-600 text-white font-medium"
              >
                Resume ↗
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
