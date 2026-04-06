"use client";

type Props = {
  children: React.ReactNode;
};

export default function WatermarkOverlay({ children }: Props) {
  return (
    <div className="relative">
      {children}
      <span
        className="absolute right-3 bottom-3 text-sm font-medium text-white opacity-70"
        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
      >
        🐾 yolo.jp
      </span>
    </div>
  );
}
