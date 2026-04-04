"use client";

import { useSyncExternalStore, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function Header() {
  const { isOpen, openCart, closeCart, totalItems, items } = useCartStore();
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const pulseRef = useRef<HTMLButtonElement>(null);
  const prevItemCount = useRef(0);

  const count = mounted ? totalItems() : 0;

  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  // Pulse via DOM class toggle when quantity increases
  useEffect(() => {
    if (totalQty > prevItemCount.current && pulseRef.current) {
      pulseRef.current.classList.add("animate-cart-pulse");
      const timer = setTimeout(() => pulseRef.current?.classList.remove("animate-cart-pulse"), 400);
      prevItemCount.current = totalQty;
      return () => clearTimeout(timer);
    }
    prevItemCount.current = totalQty;
  }, [totalQty]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-md h-16 px-6 md:px-12 flex justify-between items-center border-b border-stone-200/30">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/images/new logo.webp"
          alt="AFRICA SHOP"
          width={120}
          height={40}
          className="h-8 w-auto"
          priority
        />
      </Link>
      <button
        ref={pulseRef}
        type="button"
        onClick={isOpen ? closeCart : openCart}
        className="font-jakarta font-bold text-xs uppercase tracking-wider transition-transform duration-400"
      >
        Кошик{count > 0 && <span className="font-grotesk"> ({count})</span>}
      </button>
    </header>
  );
}
