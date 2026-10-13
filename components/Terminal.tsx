"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Reveal from "@/components/Reveal";
import { useView } from "@/components/ViewProvider";
import { experiences } from "@/data/experience";
import { projectFor, projects } from "@/data/projects";
import { layers, site } from "@/data/site";
import { skillCategories } from "@/data/skills";
import { copy, views, type View } from "@/data/views";
import { nextTheme, switchTheme } from "@/lib/theme";

type Line = string | { text: string; href: string };
interface Entry {
  id: number;
  cmd: string;
  lines: Line[];
}

const CHIPS = ["help", "whoami", "experience", "projects", "skills", "contact"];

const sectionIds = ["about", "experience", "projects", "lab", "skills", "education", "achievements", "contact"];

export default function Terminal() {
  const { view, setView } = useView();
  const [log, setLog] = useState<Entry[]>([]);
  const [value, setValue] = useState("");
  const [past, setPast] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const scroller = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  // Keep the newest output in view without moving the page.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  const c = copy[view];

  const answer = useMemo(
    () =>
      (raw: string): Line[] | "clear" => {
        const [cmd, ...args] = raw.trim().toLowerCase().split(/\s+/);
        const arg = args.join(" ");
        switch (cmd) {
          case "help":
            return [
              "Commands:",
              "  whoami        who I am",
              "  experience    where I have worked",
              "  projects      what I have built",
              "  skills        what I work with",
              "  stack         the layers I work across",
              "  contact       how to reach me",
              "  resume        open my resume",
              "  goto <name>   jump to a section",
              "  view <name>   general, software or ml",
              "  theme         toggle light or dark",
              "  clear         clear the screen",
            ];
          case "whoami":
          case "about":
            return [c.about.replace(/[[\]]/g, ""), "", c.sub];
          case "experience":
            return c.experienceOrder.map((id) => {
              const e = experiences.find((x) => x.id === id)!;
              return `${e.period.padEnd(20)} ${e.company} (${e.role})`;
            });
          case "projects":
            return c.projectOrder.map((id) => {
              const p = projectFor(projects.find((x) => x.id === id)!, view);
              return `${p.title.padEnd(28)} ${p.subtitle}`;
            });
          case "skills":
            return c.skillOrder.map((name) => {
              const cat = skillCategories.find((x) => x.category === name)!;
              const list = cat.skills.filter((s) => !cat.hide?.[view as "software" | "ml"]?.includes(s));
              return `${name}: ${list.join(", ")}`;
            });
          case "stack":
            return c.layers.map((id) => {
              const l = layers.find((x) => x.id === id)!;
              return `${l.name.padEnd(12)} ${l.detail}`;
            });
          case "contact":
            return [
              { text: site.email, href: `mailto:${site.email}` },
              { text: "GitHub", href: site.github },
              { text: "LinkedIn", href: site.linkedin },
            ];
          case "resume":
            window.open(site.resume, "_blank", "noopener");
            return ["Opening resume in a new tab…"];
          case "goto": {
            const id = sectionIds.find((s) => s.startsWith(arg) && arg);
            if (!id) return [`No section "${arg}". Try: ${sectionIds.join(", ")}.`];
            document.getElementById(id)?.scrollIntoView();
            return [`Jumping to ${id}…`];
          }
          case "view": {
            const v = views.find((x) => x.id === arg);
            if (!v) return ["Usage: view general | software | ml"];
            setView(v.id as View);
            return [`Switched to the ${v.label} view.`];
          }
          case "theme":
            {
              const next = nextTheme();
              switchTheme();
              return [`Theme set to ${next}.`];
            }
          case "sudo":
            return arg.includes("hire")
              ? ["Permission granted.", `Available from June 2027. Email me: ${site.email}`]
              : ["Nice try. Type help."];
          case "clear":
            return "clear";
          case "":
            return [];
          default:
            return [`command not found: ${cmd}. Type help.`];
        }
      },
    [c, view, setView],
  );

  const submit = (raw: string) => {
    const out = answer(raw);
    if (out === "clear") {
      setLog([]);
    } else if (raw.trim()) {
      setLog((l) => [...l, { id: nextId.current++, cmd: raw.trim(), lines: out }]);
    }
    if (raw.trim()) setPast((p) => [raw.trim(), ...p]);
    setCursor(-1);
    setValue("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const n = Math.min(cursor + 1, past.length - 1);
      if (n >= 0) {
        setCursor(n);
        setValue(past[n]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const n = cursor - 1;
      setCursor(n);
      setValue(n >= 0 ? past[n] : "");
    }
  };

  return (
    <section id="terminal" className="border-t border-line">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <h2 className="max-w-[16ch] text-[clamp(2.4rem,4.4vw,4rem)] font-semibold leading-[1] tracking-[-0.04em]">
          Ask the terminal
        </h2>
        <p className="mt-6 max-w-[48ch] text-muted">
          Type a command or tap one. It answers for whichever view you are on.
        </p>

        <Reveal className="mt-12 border border-line bg-sunken font-mono text-[0.85rem] leading-relaxed">
          <p className="label border-b border-line px-5 py-3">prasanth@portfolio ~ {view}</p>

          <div
            ref={scroller}
            role="log"
            aria-live="polite"
            className="h-80 overflow-y-auto overscroll-contain px-5 py-4"
          >
            <p className="text-muted">Type <span className="text-ink">help</span> to see what I can answer.</p>
            {log.map((e) => (
              <div key={e.id} className="mt-4">
                <p>
                  <span className="text-accent-text">$</span> {e.cmd}
                </p>
                {e.lines.map((line, i) =>
                  typeof line === "string" ? (
                    <p key={i} className="whitespace-pre-wrap break-words text-muted">
                      {line || " "}
                    </p>
                  ) : (
                    <p key={i}>
                      <a href={line.href} target={line.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" className="link-u text-ink">
                        {line.text}
                      </a>
                    </p>
                  ),
                )}
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(value);
            }}
            className="flex items-center gap-3 border-t border-line px-5 focus-within:border-accent"
          >
            <label htmlFor="term-input" className="text-accent-text">
              $
              <span className="sr-only">Terminal command</span>
            </label>
            <input
              id="term-input"
              name="term-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="type a command…"
              className="h-12 min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-muted"
            />
          </form>

          <ul className="flex flex-wrap gap-2 border-t border-line px-5 py-3">
            {CHIPS.map((chip) => (
              <li key={chip}>
                <button
                  type="button"
                  onClick={() => submit(chip)}
                  className="border border-line px-3 py-1.5 text-[0.78rem] transition-colors duration-150 hover:border-ink hover:bg-ink hover:text-bg"
                >
                  {chip}
                </button>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
