"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, animate } from "framer-motion";
import { useCartStore } from "@/store/cart";

export function Header() {
  const { isOpen, openCart, closeCart, totalItems, items } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const prevItemCount = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const count = mounted ? totalItems() : 0;

  // Pulse when items change (added to cart)
  useEffect(() => {
    if (!mounted) return;
    const currentCount = items.length;
    if (currentCount > prevItemCount.current && buttonRef.current) {
      // Scale up then back
      animate(buttonRef.current, {
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1],
      }, {
        duration: 0.4,
        ease: "easeOut",
      });
    }
    prevItemCount.current = currentCount;
  }, [items, mounted]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-md h-16 px-6 md:px-12 flex justify-between items-center border-b border-stone-200/30">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/images/new logo.PNG"
          alt="AFRICA SHOP"
          width={120}
          height={40}
          className="h-8 w-auto"
          priority
        />
      </Link>
      <motion.button
        ref={buttonRef}
        type="button"
        onClick={isOpen ? closeCart : openCart}
        className="font-jakarta font-bold text-xs uppercase tracking-wider"
      >
        Кошик{count > 0 && ` (${count})`}
      </motion.button>
    </header>
  );
}
