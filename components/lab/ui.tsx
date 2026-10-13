"use client";

export function Slider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  readout,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  readout?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="label">
          {label}
        </label>
        <span className="font-mono text-sm tabular-nums">
          {readout ?? value}
        </span>
      </div>
      <input
        id={id}
        name={id}
        type="range"
        className="range mt-1"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  hint,
  delta,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
  delta?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-4 border-b border-line py-4 text-left first:pt-0 last:border-b-0"
    >
      <span
        aria-hidden
        className={`relative mt-1 h-5 w-10 shrink-0 border transition-colors duration-200 ${
          checked ? "border-ink bg-ink" : "border-line"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-3.5 w-3.5 transition-transform duration-200 ${
            checked ? "translate-x-5 bg-bg" : "bg-muted"
          }`}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg font-semibold leading-tight tracking-tight">
          {label}
        </span>
        <span className="mt-1 block text-[0.92rem] leading-snug text-muted">
          {hint}
        </span>
      </span>
      {delta && (
        <span className="label shrink-0 pt-1.5 tabular-nums">{delta}</span>
      )}
    </button>
  );
}

export function Btn({
  children,
  onClick,
  variant = "solid",
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "solid" | "line";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`label inline-flex h-10 items-center px-5 transition-[background-color,color,transform] duration-200 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40 ${
        variant === "solid"
          ? "bg-ink !text-bg hover:bg-accent hover:!text-[#14181a]"
          : "border border-ink !text-ink hover:bg-ink hover:!text-bg"
      }`}
    >
      {children}
    </button>
  );
}

// Maps a pointer event to SVG viewBox coordinates.
export function svgPoint(
  e: { clientX: number; clientY: number; currentTarget: Element },
  w: number,
  h: number,
) {
  const r = e.currentTarget.getBoundingClientRect();
  return {
    x: Math.min(w, Math.max(0, ((e.clientX - r.left) / r.width) * w)),
    y: Math.min(h, Math.max(0, ((e.clientY - r.top) / r.height) * h)),
  };
}

// Goal, running score and saved best, shown above every game.
export function ScoreBar({
  goal,
  score,
  best,
  fmt = String,
}: {
  goal: string;
  score: number;
  best: number | null;
  fmt?: (n: number) => string;
}) {
  return (
    <div className="grid border border-line bg-bg sm:grid-cols-[1fr_auto_auto]">
      <p className="px-4 py-3 text-[0.95rem] leading-snug">
        <span className="label mr-3">Goal</span>
        {goal}
      </p>
      <p className="border-t border-line px-5 py-3 sm:border-l sm:border-t-0">
        <span className="label block">Score</span>
        <span className="font-mono text-lg tabular-nums">{fmt(score)}</span>
      </p>
      <p className="border-t border-line px-5 py-3 sm:border-l sm:border-t-0">
        <span className="label block">Best</span>
        <span className="font-mono text-lg tabular-nums">
          {best === null ? "none yet" : fmt(best)}
        </span>
      </p>
    </div>
  );
}

// Shown when a run ends: what happened, the score, and where the idea shows up in real work.
export function ResultCard({
  win,
  headline,
  detail,
  real,
  score,
  best,
  fmt = String,
  onAgain,
  again = "Play again",
}: {
  win: boolean;
  headline: string;
  detail: string;
  real: string;
  score: number;
  best: number | null;
  fmt?: (n: number) => string;
  onAgain: () => void;
  again?: string;
}) {
  const newBest = best !== null && score >= best && score > 0;
  return (
    <div
      role="status"
      className={`border bg-bg p-5 ${win ? "border-ink" : "border-accent"}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p
          className={`font-display text-2xl font-semibold tracking-tight ${win ? "" : "text-accent-text"}`}
        >
          {headline}
        </p>
        <p className="label tabular-nums">
          Score {fmt(score)}
          {newBest ? ", your best" : ""}
        </p>
      </div>
      <p className="mt-2 max-w-[62ch] text-[0.95rem] leading-snug">{detail}</p>
      <p className="mt-3 max-w-[62ch] text-[0.92rem] leading-snug text-muted">
        {real}
      </p>
      <div className="mt-5">
        <Btn onClick={onAgain}>{again}</Btn>
      </div>
    </div>
  );
}
