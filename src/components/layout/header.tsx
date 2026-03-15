"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";

export function Header() {
  const { openCart, totalItems } = useCartStore();
  const count = totalItems();

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-black h-16 px-4 md:px-8 flex justify-between items-center">
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
        onClick={openCart}
        className="font-mono text-sm uppercase tracking-widest"
      >
        Кошик{count > 0 && ` (${count})`}
      </button>
    </header>
  );
}
