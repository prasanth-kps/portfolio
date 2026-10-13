import { allBullets, experiences } from "@/data/experience";
import { projectFor, projects } from "@/data/projects";
import { skillCategories } from "@/data/skills";
import { copy, type View } from "@/data/views";

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Whole-token match so "C" does not hit "Cloud" and "Go" does not hit "Google".
// Short names are case-sensitive so "C" and "Go" only match the language.
export function mentions(haystack: string, name: string) {
  return name.split(" / ").some((alt) => {
    const re = new RegExp(`(?<![A-Za-z0-9+#])${esc(alt)}(?![A-Za-z0-9+#])`, alt.length <= 3 ? "" : "i");
    return re.test(haystack);
  });
}

export interface Source {
  id: string;
  kind: "experience" | "project";
  label: string;
  // Short label for crowded diagrams.
  short: string;
  href: string;
  text: string;
}

const SHORT: Record<string, string> = {
  "Enphase Energy": "Enphase",
  "Visa Inc.": "Visa",
  "Oqlo.ai (3rdi Corp)": "Oqlo.ai",
  "Disaster Response Framework": "Disaster Response",
  "Remote Patient Monitoring": "Patient Monitoring",
  "Job Board Crawler": "Job Crawler",
};

// The jobs and projects the current view still shows, with the text a skill can be matched against.
export const sourcesFor = (view: View): Source[] => [
  ...experiences
    .filter((e) => copy[view].experienceOrder.includes(e.id))
    .map((e) => ({
      id: e.id,
      kind: "experience" as const,
      label: e.company,
      short: SHORT[e.company] ?? e.company,
      href: `#exp-${e.id}`,
      text: [e.role, e.company, ...allBullets(e), ...e.skills].join(" | "),
    })),
  ...copy[view].projectOrder
    .map((id) => projectFor(projects.find((p) => p.id === id)!, view))
    .map((p) => ({
      id: p.id,
      kind: "project" as const,
      label: p.title,
      short: SHORT[p.title] ?? p.title,
      href: `#project-${p.id}`,
      text: [p.title, p.subtitle, p.description, ...p.tags, ...p.flow.flat().map((x) => x.label)].join(" | "),
    })),
];

// Every skill the current view shows, once each.
export const visibleSkills = (view: View): string[] => {
  const out = new Set<string>();
  for (const name of copy[view].skillOrder) {
    const c = skillCategories.find((x) => x.category === name)!;
    for (const s of c.skills) if (view === "general" || !c.hide?.[view]?.includes(s)) out.add(s);
  }
  return [...out];
};
