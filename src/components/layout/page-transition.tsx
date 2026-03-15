"use client";

import { motion } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={false}
      animate={{ clipPath: "inset(0 0 0 0)" }}
      transition={{
        duration: 0.6,
        ease: [0.77, 0, 0.175, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
