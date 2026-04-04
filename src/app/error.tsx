"use client";

import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { PrecisionButton } from "@/components/ui/precision-button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-pearl px-6">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="mx-auto w-20 h-20 rounded-full bg-coral/10 flex items-center justify-center mb-8"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-coral"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 30 }}
            className="font-jakarta text-2xl font-bold tracking-tight mb-3"
          >
            Щось пішло не так
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            className="text-sm text-stone-500 mb-8 max-w-xs mx-auto"
          >
            Виникла несподівана помилка. Спробуйте оновити сторінку.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 30 }}
          >
            <PrecisionButton onClick={reset}>
              Спробувати ще раз
            </PrecisionButton>
          </motion.div>
        </div>
      </main>
    </>
  );
}
