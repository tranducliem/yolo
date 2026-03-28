"use client";

import { useState } from "react";

export type MockupType =
  | "acrylic" | "mug" | "tshirt" | "phonecase" | "cushion" | "towel"
  | "figure-mini" | "figure-standard" | "figure-premium"
  | "book-pocket" | "book-bunko" | "book-life";

interface Props {
  type: MockupType;
  petName?: string;
  className?: string;
}

const PET_IMG = "https://placedog.net/300/300?id=1";

function PetPhoto({ className }: { className?: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div className={`bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200 flex items-center justify-center ${className}`}>
        <span className="text-3xl">🐾</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={PET_IMG}
      alt="pet"
      className={`object-cover ${className}`}
      onError={() => setErr(true)}
    />
  );
}

/* ── Acrylic Stand ── */
function AcrylicMockup() {
  return (
    <div className="w-full aspect-square bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      {/* Stand body */}
      <div className="relative w-[60%] aspect-square rounded-xl overflow-hidden border-2 border-white shadow-lg"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.4) 100%)" }}>
        <PetPhoto className="w-full h-full absolute inset-0 opacity-90" />
        {/* Glass reflection */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
      </div>
      {/* Base */}
      <div className="w-[20%] h-3 bg-gradient-to-b from-gray-300 to-gray-400 rounded-b mt-0" />
      <div className="w-[35%] h-2 bg-gradient-to-b from-gray-400 to-gray-500 rounded-b-lg" />
      <span className="text-[9px] text-gray-400 mt-1">アクリルスタンド</span>
    </div>
  );
}

/* ── Mug ── */
function MugMockup() {
  return (
    <div className="w-full aspect-square bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="relative w-[70%] aspect-[4/5] flex items-center">
        {/* Mug body */}
        <div className="relative w-[80%] h-full rounded-lg overflow-hidden bg-white shadow-md border border-gray-200">
          <PetPhoto className="w-full h-full" />
          {/* Ceramic sheen */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-black/10 pointer-events-none" />
        </div>
        {/* Handle */}
        <div className="absolute -right-1 top-[20%] w-[25%] h-[45%] border-4 border-gray-300 rounded-r-full bg-transparent" />
      </div>
    </div>
  );
}

/* ── T-Shirt ── */
function TshirtMockup() {
  return (
    <div className="w-full aspect-square bg-gradient-to-b from-blue-50 to-indigo-50 flex items-center justify-center p-3">
      <div className="relative w-[85%] h-[90%]">
        {/* T-shirt shape */}
        <svg viewBox="0 0 200 220" className="w-full h-full">
          <defs>
            <clipPath id="shirt-clip">
              <path d="M60,0 L80,0 Q100,15 120,0 L140,0 L200,50 L170,70 L150,55 L150,220 L50,220 L50,55 L30,70 L0,50 Z" />
            </clipPath>
          </defs>
          {/* Shirt body */}
          <path d="M60,0 L80,0 Q100,15 120,0 L140,0 L200,50 L170,70 L150,55 L150,220 L50,220 L50,55 L30,70 L0,50 Z"
            fill="white" stroke="#ddd" strokeWidth="1" />
        </svg>
        {/* Pet photo on chest */}
        <div className="absolute top-[25%] left-[28%] w-[44%] aspect-square rounded-md overflow-hidden shadow-sm">
          <PetPhoto className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}

/* ── Phone Case ── */
function PhonecaseMockup() {
  return (
    <div className="w-full aspect-square bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="relative w-[50%] aspect-[9/19] rounded-[16px] overflow-hidden border-[3px] border-gray-800 shadow-lg bg-gray-900">
        {/* Camera bump */}
        <div className="absolute top-2 left-2 w-[35%] aspect-square rounded-xl bg-gray-700 z-10 flex items-center justify-center gap-1 p-1">
          <div className="w-3 h-3 rounded-full bg-gray-600 border border-gray-500" />
          <div className="w-3 h-3 rounded-full bg-gray-600 border border-gray-500" />
        </div>
        {/* Case back with pet photo */}
        <PetPhoto className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10 pointer-events-none" />
      </div>
    </div>
  );
}

/* ── Cushion ── */
function CushionMockup() {
  return (
    <div className="w-full aspect-square bg-gradient-to-b from-rose-50 to-pink-50 flex items-center justify-center p-4">
      <div className="relative w-[75%] aspect-square rounded-2xl overflow-hidden shadow-lg"
        style={{ boxShadow: "inset 0 0 20px rgba(0,0,0,0.1), 4px 6px 12px rgba(0,0,0,0.15)" }}>
        <PetPhoto className="w-full h-full" />
        {/* Fabric texture overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "4px 4px" }} />
        {/* Puffy edge effect */}
        <div className="absolute inset-0 rounded-2xl border-4 border-white/30 pointer-events-none" />
      </div>
    </div>
  );
}

/* ── Towel ── */
function TowelMockup() {
  return (
    <div className="w-full aspect-square bg-gradient-to-b from-cyan-50 to-teal-50 flex items-center justify-center p-3">
      <div className="relative w-[80%] aspect-[2/3] rounded-lg overflow-hidden shadow-md"
        style={{ boxShadow: "2px 4px 10px rgba(0,0,0,0.1)" }}>
        <PetPhoto className="w-full h-full" />
        {/* Towel texture */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 3px)", backgroundSize: "100% 4px" }} />
        {/* Fringe bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-b from-transparent to-white/50"
          style={{ backgroundImage: "repeating-linear-gradient(90deg, currentColor 0px, transparent 1px, transparent 4px)", backgroundSize: "5px 100%", color: "rgba(255,255,255,0.4)" }} />
      </div>
    </div>
  );
}

/* ── Figure (3 sizes) ── */
function FigureMockup({ size }: { size: "mini" | "standard" | "premium" }) {
  const h = size === "mini" ? "h-[40%]" : size === "standard" ? "h-[55%]" : "h-[70%]";
  const label = size === "mini" ? "3cm" : size === "standard" ? "7cm" : "12cm";
  const bg = size === "premium"
    ? "from-amber-50 to-yellow-50"
    : size === "standard"
      ? "from-violet-50 to-purple-50"
      : "from-emerald-50 to-teal-50";

  return (
    <div className={`w-full aspect-[16/9] bg-gradient-to-b ${bg} flex flex-col items-center justify-end pb-4`}>
      {/* Figure body */}
      <div className={`relative ${h} aspect-[3/4] flex flex-col items-center`}>
        {/* 3D-ish pet shape */}
        <div className="flex-1 w-full rounded-t-full overflow-hidden shadow-lg border-2 border-white"
          style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          <PetPhoto className="w-full h-full" />
          {/* 3D highlight */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/20 rounded-t-full pointer-events-none" />
        </div>
      </div>
      {/* Pedestal */}
      <div className="w-[30%] h-2 bg-gradient-to-b from-gray-300 to-gray-400 rounded-sm mt-1" />
      <div className="w-[40%] h-3 bg-gradient-to-b from-gray-400 to-gray-500 rounded-b-md" />
      <span className="text-[9px] text-gray-400 mt-1">{label} フィギュア</span>
    </div>
  );
}

/* ── Book (3 types) ── */
function BookMockup({ variant }: { variant: "pocket" | "bunko" | "life" }) {
  const aspect = variant === "pocket" ? "aspect-[3/4]" : variant === "bunko" ? "aspect-[3/4]" : "aspect-[3/4]";
  const w = variant === "pocket" ? "w-[50%]" : variant === "bunko" ? "w-[55%]" : "w-[65%]";
  const label = variant === "pocket" ? "POCKET" : variant === "bunko" ? "BUNKO" : "LIFE";
  const bg = variant === "life"
    ? "from-amber-50 to-orange-50"
    : variant === "bunko"
      ? "from-sky-50 to-blue-50"
      : "from-green-50 to-emerald-50";

  return (
    <div className={`w-full h-full bg-gradient-to-b ${bg} flex items-center justify-center p-4`}>
      <div className="relative flex">
        {/* Book spine */}
        <div className="w-3 h-full bg-gradient-to-r from-gray-600 to-gray-500 rounded-l-sm shadow-inner" />
        {/* Book cover */}
        <div className={`relative ${w} ${aspect} bg-white rounded-r-sm overflow-hidden shadow-lg border border-gray-200`}
          style={{ minWidth: "80px" }}>
          {/* Cover photo */}
          <PetPhoto className="w-full h-full" />
          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
            <p className="text-white text-[10px] font-bold">{label}</p>
            <p className="text-white/70 text-[8px]">YOLO Book</p>
          </div>
          {/* Book edge highlight */}
          <div className="absolute inset-0 border border-white/20 pointer-events-none rounded-r-sm" />
        </div>
        {/* Obi (belt) for bunko and life */}
        {(variant === "bunko" || variant === "life") && (
          <div className="absolute bottom-[15%] left-0 right-0 h-[25%] bg-accent/80 flex items-center justify-center">
            <span className="text-white text-[8px] font-bold">YOLO おすすめ</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function ProductMockup({ type, className }: Props) {
  const wrap = `overflow-hidden ${className ?? ""}`;

  switch (type) {
    case "acrylic": return <div className={wrap}><AcrylicMockup /></div>;
    case "mug": return <div className={wrap}><MugMockup /></div>;
    case "tshirt": return <div className={wrap}><TshirtMockup /></div>;
    case "phonecase": return <div className={wrap}><PhonecaseMockup /></div>;
    case "cushion": return <div className={wrap}><CushionMockup /></div>;
    case "towel": return <div className={wrap}><TowelMockup /></div>;
    case "figure-mini": return <div className={wrap}><FigureMockup size="mini" /></div>;
    case "figure-standard": return <div className={wrap}><FigureMockup size="standard" /></div>;
    case "figure-premium": return <div className={wrap}><FigureMockup size="premium" /></div>;
    case "book-pocket": return <div className={wrap}><BookMockup variant="pocket" /></div>;
    case "book-bunko": return <div className={wrap}><BookMockup variant="bunko" /></div>;
    case "book-life": return <div className={wrap}><BookMockup variant="life" /></div>;
    default: return <div className={wrap}><div className="w-full aspect-square bg-gray-100 flex items-center justify-center"><span className="text-4xl">📦</span></div></div>;
  }
}
