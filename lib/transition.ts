import { flushSync } from "react-dom";

interface VTDocument {
  startViewTransition?: (cb: () => void | Promise<void>) => { finished: Promise<void> };
}

// Runs `update` as a soft page-wide dissolve (styled in globals.css). Falls back to a plain
// update where View Transitions are unsupported or motion is reduced.
export function transition(update: () => void) {
  const doc = document as unknown as VTDocument;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!doc.startViewTransition || reduced) {
    update();
    return;
  }
  const root = document.documentElement;
  root.setAttribute("data-vt", "");
  const t = doc.startViewTransition(() => {
    flushSync(update);
  });
  const done = () => root.removeAttribute("data-vt");
  t.finished.then(done, done);
}
