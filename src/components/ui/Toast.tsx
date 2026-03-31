"use client";

import { useEffect, useState, createContext, useContext, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Msg { id: number; message: string; type: "success" | "error" }
const Ctx = createContext<{ show: (m: string, t?: "success" | "error") => void }>({ show: () => {} });
export const useToast = () => useContext(Ctx);

let _id = 0;
export function ToastProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<Msg[]>([]);
  const show = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = ++_id;
    setList((p) => [...p, { id, message, type }]);
  }, []);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {list.map((t) => (
            <Item key={t.id} t={t} onDone={() => setList((p) => p.filter((x) => x.id !== t.id))} />
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

function Item({ t, onDone }: { t: Msg; onDone: () => void }) {
  useEffect(() => { const h = setTimeout(onDone, 3000); return () => clearTimeout(h); }, [onDone]);
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className={`px-6 py-3 rounded-xl text-white text-sm font-medium shadow-lg ${t.type === "success" ? "bg-accent" : "bg-red"}`}>
      {t.message}
    </motion.div>
  );
}
