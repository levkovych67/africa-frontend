"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";

export function Header() {
  const { isOpen, openCart, closeCart, totalItems, items } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const prevItemCount = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const count = mounted ? totalItems() : 0;

  // Pulse when total quantity increases
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
  useEffect(() => {
    if (!mounted) return;
    if (totalQty > prevItemCount.current) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 400);
      return () => clearTimeout(timer);
    }
    prevItemCount.current = totalQty;
  }, [totalQty, mounted]);

  // Update ref outside the cleanup path
  useEffect(() => {
    if (mounted) {
      prevItemCount.current = totalQty;
    }
  }, [totalQty, mounted]);

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
      <button
        type="button"
        onClick={isOpen ? closeCart : openCart}
        className={`font-jakarta font-bold text-xs uppercase tracking-wider transition-transform duration-400 ${
          isPulsing ? "animate-cart-pulse" : ""
        }`}
      >
        Кошик{count > 0 && <span className="font-grotesk"> ({count})</span>}
      </button>
    </header>
  );
}
