"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { View } from "@/data/views";

const isView = (v: string | null): v is View => v === "general" || v === "software" || v === "ml";

const ViewContext = createContext<{ view: View; setView: (v: View) => void }>({
  view: "general",
  setView: () => {},
});

// The chosen view lives in the URL (?view=ml) so a tailored link can be shared.
export function ViewProvider({ children }: { children: React.ReactNode }) {
  const [view, setViewState] = useState<View>("general");

  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("view");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isView(v)) setViewState(v);
  }, []);

  const setView = useCallback((v: View) => {
    setViewState(v);
    const url = new URL(window.location.href);
    if (v === "general") url.searchParams.delete("view");
    else url.searchParams.set("view", v);
    window.history.replaceState(null, "", url);
  }, []);

  return <ViewContext.Provider value={{ view, setView }}>{children}</ViewContext.Provider>;
}

export const useView = () => useContext(ViewContext);
