"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/components/ToastProvider";
import { useView } from "@/components/ViewProvider";
import { experiences } from "@/data/experience";
import { projectFor, projects } from "@/data/projects";
import { resumeFor, site } from "@/data/site";
import { copy, views } from "@/data/views";
import { switchTheme } from "@/lib/theme";

interface Item {
  id: string;
  group: string;
  label: string;
  hint?: string;
  keywords?: string;
  run: () => void;
}

const sections = [
  ["about", "About"],
  ["experience", "Experience"],
  ["projects", "Projects"],
  ["lab", "Try the work"],
  ["skills", "Skills"],
  ["education", "Education"],
  ["achievements", "Ranks & recognition"],
  ["terminal", "Ask the terminal"],
  ["contact", "Contact"],
] as const;

// ⌘K / Ctrl+K or "/" opens it. The nav button opens it through a window event.
export default function CommandBar() {
  const { view, setView } = useView();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const show = useCallback(() => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setIndex(0);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    setOpen(false);
    returnFocus.current?.focus?.();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.closest("input, textarea, [contenteditable=true]");
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => {
          if (!o) returnFocus.current = document.activeElement as HTMLElement | null;
          return !o;
        });
        setQuery("");
        setIndex(0);
      } else if (e.key === "/" && !typing && !open) {
        e.preventDefault();
        show();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command", show);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command", show);
    };
  }, [open, show]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const go = (id: string) => () => document.getElementById(id)?.scrollIntoView();
    const c = copy[view];
    return [
      ...sections.map(([id, label]) => ({ id: `go-${id}`, group: "Go to", label, run: go(id) })),
      ...c.projectOrder.map((id) => {
        const p = projectFor(projects.find((x) => x.id === id)!, view);
        return { id: `p-${id}`, group: "Projects", label: p.title, hint: p.subtitle, keywords: p.tags.join(" "), run: go(`project-${id}`) };
      }),
      ...c.experienceOrder.map((id) => {
        const e = experiences.find((x) => x.id === id)!;
        return { id: `e-${id}`, group: "Experience", label: e.company, hint: e.role, keywords: e.skills.join(" "), run: go(`exp-${id}`) };
      }),
      ...views.map((v) => ({
        id: `v-${v.id}`,
        group: "View this site as",
        label: v.label,
        hint: v.id === view ? "current" : undefined,
        keywords: "view tailor",
        run: () => setView(v.id),
      })),
      { id: "a-theme", group: "Actions", label: "Toggle light or dark theme", keywords: "theme dark light mode", run: () => switchTheme() },
      { id: "a-resume", group: "Actions", label: "Open resume", hint: resumeFor(view).name, keywords: "cv pdf", run: () => window.open(resumeFor(view).href, "_blank", "noopener") },
      {
        id: "a-copy",
        group: "Actions",
        label: "Copy email",
        hint: site.email,
        keywords: "mail contact",
        run: () => {
          navigator.clipboard
            .writeText(site.email)
            .then(() => toast("Email copied"))
            .catch(() => toast(site.email));
        },
      },
      { id: "a-github", group: "Actions", label: "Open GitHub", keywords: "code repos", run: () => window.open(site.github, "_blank", "noopener") },
      { id: "a-linkedin", group: "Actions", label: "Open LinkedIn", keywords: "profile", run: () => window.open(site.linkedin, "_blank", "noopener") },
    ];
  }, [view, setView, toast]);

  const results = useMemo(() => {
    const n = query.trim().toLowerCase();
    if (!n) return items;
    const hay = (i: Item) => `${i.label} ${i.hint ?? ""} ${i.keywords ?? ""} ${i.group}`.toLowerCase();
    return items
      .filter((i) => hay(i).includes(n))
      .sort((a, b) => Number(b.label.toLowerCase().startsWith(n)) - Number(a.label.toLowerCase().startsWith(n)));
  }, [items, query]);

  const active = results[Math.min(index, results.length - 1)];

  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [index, results]);

  const run = (item: Item | undefined) => {
    if (!item) return;
    setOpen(false);
    returnFocus.current?.focus?.();
    // Let the overlay leave before scrolling so the jump lands cleanly.
    requestAnimationFrame(() => item.run());
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      hide();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => (i + 1) % Math.max(results.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => (i - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(active);
    } else if (e.key === "Tab") {
      e.preventDefault();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-ink/40 px-4 pt-[12vh] backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onMouseDown={(e) => e.target === e.currentTarget && hide()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            className="w-full max-w-xl border border-ink bg-bg"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onKeyDown={onKeyDown}
          >
            <label htmlFor="cmd-input" className="sr-only">
              Search sections, projects and actions
            </label>
            <input
              ref={input}
              id="cmd-input"
              name="cmd-input"
              role="combobox"
              aria-expanded="true"
              aria-controls="cmd-list"
              aria-activedescendant={active ? `cmd-${active.id}` : undefined}
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIndex(0);
              }}
              placeholder="Jump to a section, project or action…"
              className="h-14 w-full border-b border-line bg-transparent px-5 font-mono text-[0.95rem] text-ink outline-none placeholder:text-muted focus:border-accent"
            />

            <ul ref={list} id="cmd-list" role="listbox" aria-label="Results" className="max-h-[50vh] overflow-y-auto overscroll-contain py-2">
              {results.length === 0 && <li className="px-5 py-6 font-mono text-sm text-muted">No matches. Try “projects” or “resume”.</li>}
              {results.map((item, i) => {
                const header = i === 0 || results[i - 1].group !== item.group;
                const on = item === active;
                return (
                  <li key={item.id} role="presentation">
                    {header && <p className="label px-5 pb-1 pt-3">{item.group}</p>}
                    <div
                      id={`cmd-${item.id}`}
                      role="option"
                      aria-selected={on}
                      onMouseMove={() => setIndex(i)}
                      onClick={() => run(item)}
                      className={`flex cursor-pointer items-baseline justify-between gap-4 px-5 py-2.5 transition-colors duration-100 ${
                        on ? "bg-ink text-bg" : ""
                      }`}
                    >
                      <span className="font-display text-lg font-semibold tracking-tight">{item.label}</span>
                      {item.hint && <span className={`truncate font-mono text-xs ${on ? "text-bg/70" : "text-muted"}`}>{item.hint}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>

            <p className="label flex gap-5 border-t border-line px-5 py-3">
              <span>↑↓ move</span>
              <span>↵ select</span>
              <span>esc close</span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
