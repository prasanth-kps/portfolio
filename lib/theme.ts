import { transition } from "@/lib/transition";

export type Theme = "light" | "dark";

export function currentTheme(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(t: Theme) {
  document.documentElement.setAttribute("data-theme", t);
  try {
    localStorage.setItem("theme", t);
  } catch {
    /* storage unavailable: theme still applies for this visit */
  }
}

export function toggleTheme(): Theme {
  const next: Theme = currentTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}

export const nextTheme = (): Theme => (currentTheme() === "dark" ? "light" : "dark");

// Theme change as a soft page-wide dissolve.
export function switchTheme() {
  transition(() => {
    toggleTheme();
  });
}
