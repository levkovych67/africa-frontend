"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PrecisionButton } from "@/components/ui/precision-button";

interface CheckoutSuccessProps {
  orderId: string;
}

export function CheckoutSuccess({ orderId }: CheckoutSuccessProps) {
  return (
    <div className="max-w-[600px] mx-auto px-6 py-20 text-center">
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
        className="mx-auto w-20 h-20 rounded-full bg-emerald/10 flex items-center justify-center mb-8"
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
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        >
          <motion.path
            d="M20 6L9 17l-5-5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          />
        </motion.svg>
      </motion.div>

      {/* Text */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 30 }}
        className="font-jakarta text-2xl font-bold tracking-tight mb-3"
      >
        Дякуємо!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 30 }}
        className="text-sm text-stone-500 mb-2"
      >
        Ваше замовлення прийнято
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 30 }}
        className="inline-block px-4 py-2 bg-stone-100 rounded-full mb-10"
      >
        <span className="font-grotesk text-sm text-stone-600 tracking-wide">
          {orderId}
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 30 }}
        className="flex flex-col gap-3 items-center"
      >
        <Link href={`/order/${orderId}`}>
          <PrecisionButton>Відстежити замовлення</PrecisionButton>
        </Link>
        <Link
          href="/"
          className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
        >
          Повернутися до магазину
        </Link>
      </motion.div>
    </div>
  );
}
