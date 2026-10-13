"use client";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ToastContext = createContext<(message: string) => void>(() => {});

// Short confirmations for actions whose result may be off-screen (view switch, copy).
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<{ id: number; message: string }[]>([]);
  const next = useRef(0);

  const push = useCallback((message: string) => {
    const id = (next.current += 1);
    setItems((all) => [...all.slice(-2), { id, message }]);
    setTimeout(() => setItems((all) => all.filter((t) => t.id !== id)), 2600);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-5 right-5 z-[70] flex w-[min(22rem,calc(100vw-2.5rem))] flex-col items-end gap-2"
      >
        <AnimatePresence>
          {items.map((t) => (
            <motion.p
              key={t.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="border-l-4 border-accent bg-ink px-4 py-3 font-mono text-[0.78rem] uppercase tracking-wider text-bg"
            >
              {t.message}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
