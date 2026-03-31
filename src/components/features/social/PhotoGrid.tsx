"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  photos: string[];
  columns?: number;
  selectable?: boolean;
  maxSelect?: number;
  selected?: number[];
  onSelect?: (indices: number[]) => void;
}

export default function PhotoGrid({ photos, columns = 3, selectable, maxSelect = 20, selected: controlledSel, onSelect }: Props) {
  const [internal, setInternal] = useState<number[]>([]);
  const [modal, setModal] = useState<number | null>(null);
  const sel = controlledSel ?? internal;

  const toggle = (i: number) => {
    const next = sel.includes(i) ? sel.filter((x) => x !== i) : sel.length < maxSelect ? [...sel, i] : sel;
    if (onSelect) onSelect(next); else setInternal(next);
  };

  return (
    <>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {photos.map((url, i) => (
          <motion.div key={i} whileTap={{ scale: 0.95 }}
            className="relative aspect-square cursor-pointer rounded-lg overflow-hidden"
            onClick={() => selectable ? toggle(i) : setModal(i)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            {selectable && sel.includes(i) && (
              <div className="absolute inset-0 bg-accent/30 flex items-center justify-center">
                <span className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{sel.indexOf(i) + 1}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {modal !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/80 flex items-center justify-center p-4" onClick={() => setModal(null)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[modal]} alt="" className="max-w-full max-h-[80vh] rounded-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
