"use client";

import { useState, useRef, useCallback } from "react";

type Props = {
  beforeUrl: string;
  afterUrl: string;
};

export default function BeforeAfterSlider({ beforeUrl, afterUrl }: Props) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="space-y-2">
      <p className="text-center text-sm font-bold text-gray-800">📷 Before / After</p>
      <div
        ref={containerRef}
        className="relative aspect-square w-full cursor-ew-resize touch-none overflow-hidden rounded-xl select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* After (full) */}
        <img
          src={afterUrl}
          alt="AIイラスト"
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />

        {/* Before (clipped) */}
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
          <img
            src={beforeUrl}
            alt="元の写真"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ width: "100%" }}
            draggable={false}
          />
        </div>

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 z-10 w-0.5 bg-white shadow-lg"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        >
          {/* Handle */}
          <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-sm font-bold text-gray-500 shadow-lg">
            ← →
          </div>
        </div>
      </div>

      <div className="flex justify-between px-1">
        <span className="text-xs text-gray-400">📷 元の写真</span>
        <span className="text-xs text-[#2A9D8F]">🎨 AIイラスト</span>
      </div>
    </div>
  );
}
