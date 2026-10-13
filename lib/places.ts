export type Scene = "snow" | "beach" | "sun" | "rain" | "rails";

// Which quiet scene each place plays. Order matters: the first keyword found wins.
const SCENES: [string, Scene][] = [
  ["madison", "snow"],
  ["san diego", "beach"],
  ["california", "sun"],
  ["bangalore", "rain"],
  ["kharagpur", "rails"],
];

export const sceneFor = (text: string): Scene | null => {
  const t = text.toLowerCase();
  return SCENES.find(([k]) => t.includes(k))?.[1] ?? null;
};
