"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/store/cart";
import { CartItemRow } from "./cart-item";
import { PrecisionButton } from "@/components/ui/precision-button";
import { formatPrice } from "@/lib/utils/price";
import Link from "next/link";

export function CartDrawer() {
  const { items, isOpen, closeCart, totalPrice } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.2, ease: "linear" }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white border-l border-black flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-black p-6">
              <h2 className="font-mono text-sm uppercase tracking-widest">
                Кошик
              </h2>
              <button
                onClick={closeCart}
                className="font-mono text-lg"
                type="button"
              >
                X
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <p className="font-mono text-sm text-black/50">
                  Кошик порожній
                </p>
              ) : (
                <div className="flex flex-col gap-6">
                  {items.map((item) => (
                    <CartItemRow key={item.sku} item={item} />
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-black p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm uppercase tracking-wide">
                    Разом
                  </span>
                  <span className="font-mono text-lg">
                    {formatPrice(totalPrice())}
                  </span>
                </div>
                <Link href="/checkout" onClick={closeCart}>
                  <PrecisionButton className="w-full">
                    Оформити замовлення
                  </PrecisionButton>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
