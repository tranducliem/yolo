"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingCTAProps {
  hasBottomNav?: boolean;
}

export default function FloatingCTA({ hasBottomNav = false }: FloatingCTAProps) {
  const [visible, setVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      // Show when scrolling down and past 200px
      if (currentY > 200 && currentY > lastScrollY) {
        setVisible(true);
      }
      // Hide when scrolling up
      if (currentY < lastScrollY) {
        setVisible(false);
      }
      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`fixed left-0 right-0 z-[45] px-4 md:hidden ${
            hasBottomNav ? "bottom-20" : "bottom-4"
          }`}
        >
          <Link
            href="/try"
            className="flex items-center justify-center w-full h-12 bg-gradient-to-r from-[#2A9D8F] to-[#238b7e] text-white font-bold rounded-full shadow-lg shadow-accent/30 hover:shadow-xl active:scale-[0.98] transition-all duration-200"
          >
            ✨ AIベストショットを試す
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
