"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { PrecisionButton } from "@/components/ui/precision-button";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-pearl px-6">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            className="font-grotesk text-[8rem] md:text-[12rem] leading-none font-bold text-stone-100 select-none"
          >
            404
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 30 }}
            className="font-jakarta font-bold text-xs uppercase tracking-widest text-stone-400 mb-2 -mt-6 md:-mt-10"
          >
            Сторінку не знайдено
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            className="text-sm text-stone-500 mb-8 max-w-xs mx-auto"
          >
            Можливо, вона була переміщена або більше не існує
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 30 }}
          >
            <Link href="/">
              <PrecisionButton>На головну</PrecisionButton>
            </Link>
          </motion.div>
        </div>
      </main>
    </>
  );
}
