"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error boundary:", error, "digest:", error.digest);
  }, [error]);

  return (
    <>
      <Header />
      <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center bg-pearl px-6 overflow-hidden">

        {/* Background Africa silhouette — large, rotated, faded */}
        <motion.div
          initial={{ opacity: 0, rotate: -8, scale: 0.9 }}
          animate={{ opacity: 0.03, rotate: -12, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute pointer-events-none select-none"
        >
          <Image
            src="/images/logov2.webp"
            alt=""
            width={800}
            height={800}
            className="w-[70vw] md:w-[500px] h-auto"
          />
        </motion.div>

        <div className="relative z-10 text-center max-w-md">

          {/* Glitch-style error code */}
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.12em" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-grotesk text-[11px] text-coral font-semibold uppercase tracking-widest mb-6"
          >
            Помилка
          </motion.p>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 250, damping: 25 }}
            className="text-h2-section mb-4"
          >
            Щось пішло не так
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            className="text-sm text-stone-500 leading-relaxed mb-10"
          >
            Виникла несподівана помилка. Не хвилюйтесь — спробуйте ще раз або оновіть сторінку.
          </motion.p>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <button
              onClick={reset}
              className="rounded-full py-3.5 px-8 font-jakarta font-bold text-xs uppercase tracking-wider bg-stone-900 text-white hover:scale-[1.02] hover:shadow-lift active:scale-[0.97] transition-all duration-200 ease-out"
            >
              Спробувати ще раз
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="rounded-full py-3.5 px-8 font-jakarta font-bold text-xs uppercase tracking-wider border border-stone-200 text-stone-600 bg-white/60 backdrop-blur-sm hover:border-stone-400 hover:scale-[1.02] active:scale-[0.97] transition-all duration-200 ease-out"
            >
              На головну
            </button>
          </motion.div>
        </div>
      </main>
    </>
  );
}
