"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WatermarkOverlay from "./WatermarkOverlay";

type Props = {
  imageUrl: string;
  petName: string;
  styleName: string;
  comment: string;
};

function TypewriterText({ text, speed = 40 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayed}</span>;
}

export default function ArtResultCard({ imageUrl, petName, styleName, comment }: Props) {
  return (
    <div className="space-y-4">
      {/* Art image with gold frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto aspect-square w-80 max-w-sm rounded-2xl"
        style={{
          padding: "4px",
          background: "linear-gradient(135deg, #D4A843, #F5D374, #D4A843, #F5D374)",
          boxShadow: "0 8px 32px rgba(212, 168, 67, 0.3)",
        }}
      >
        <WatermarkOverlay>
          <img
            src={imageUrl}
            alt={`${petName} × ${styleName}`}
            className="h-full w-full rounded-2xl object-cover"
          />
        </WatermarkOverlay>
      </motion.div>

      {/* Style label */}
      <p className="mt-4 text-center text-base font-bold text-[#2A9D8F]">
        🎨 {petName} × {styleName}
      </p>

      {/* AI comment */}
      <div className="mx-auto mt-4 max-w-xs">
        <p className="mb-1 text-xs text-gray-400">🤖 AIコメント</p>
        <p className="text-center text-[15px] leading-relaxed text-gray-700">
          <TypewriterText text={comment} />
        </p>
      </div>
    </div>
  );
}
