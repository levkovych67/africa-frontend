"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface CheckoutSuccessProps {
  orderId: string;
  accessToken?: string | null;
}

export function CheckoutSuccess({ orderId, accessToken }: CheckoutSuccessProps) {
  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center bg-pearl px-6 overflow-hidden">

      {/* Background Africa silhouette — large, rotated, faded */}
      <motion.div
        initial={{ opacity: 0, rotate: 8, scale: 0.9 }}
        animate={{ opacity: 0.03, rotate: 12, scale: 1 }}
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

        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.1,
          }}
          className="mx-auto w-20 h-20 rounded-full bg-emerald/10 flex items-center justify-center mb-6"
        >
          <motion.svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-emerald"
          >
            <motion.path
              d="M20 6L9 17l-5-5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            />
          </motion.svg>
        </motion.div>

        {/* Success label — glitch-style like error page */}
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, letterSpacing: "0.12em" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-grotesk text-[11px] text-emerald font-semibold uppercase tracking-widest mb-6"
        >
          Успішно
        </motion.p>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 250, damping: 25 }}
          className="text-h2-section mb-4"
        >
          Дякуємо!
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 30 }}
          className="text-sm text-stone-500 leading-relaxed mb-4"
        >
          Ваше замовлення прийнято
        </motion.p>

        {/* Order ID badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 30 }}
          className="inline-block px-4 py-2 bg-stone-100 rounded-full mb-10"
        >
          <span className="font-grotesk text-sm text-stone-600 tracking-wide">
            {orderId}
          </span>
        </motion.div>

        {/* Action buttons — matching error page style */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 30 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href={`/order/${orderId}${accessToken ? `?accessToken=${accessToken}` : ""}`}
            className="rounded-full py-3.5 px-8 font-jakarta font-bold text-xs uppercase tracking-wider bg-stone-900 text-white hover:scale-[1.02] hover:shadow-lift active:scale-[0.97] transition-all duration-200 ease-out"
          >
            Відстежити замовлення
          </Link>
          <Link
            href="/"
            className="rounded-full py-3.5 px-8 font-jakarta font-bold text-xs uppercase tracking-wider border border-stone-200 text-stone-600 bg-white/60 backdrop-blur-sm hover:border-stone-400 hover:scale-[1.02] active:scale-[0.97] transition-all duration-200 ease-out"
          >
            Повернутися до магазину
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
