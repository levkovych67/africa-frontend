"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCartStore, CartItem } from "@/store/cart";
import { PrecisionButton } from "@/components/ui/precision-button";
import { formatPrice } from "@/lib/utils/price";

function CartCard({ item, index }: { item: CartItem; index: number }) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: index < 4 ? index * 0.05 : 0,
      }}
      className="bg-white rounded-2xl shadow-soft p-4 flex gap-4"
    >
      <div className="relative h-28 w-24 shrink-0 rounded-xl overflow-hidden bg-stone-100">
        {item.image && (
          <Image
            src={item.image}
            alt={item.productTitle}
            fill
            className="object-cover"
            sizes="96px"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <p className="font-jakarta font-semibold text-sm text-stone-900 truncate">
            {item.productTitle}
          </p>
          <p className="font-grotesk text-xs text-stone-500 mt-0.5">
            {item.variantLabel}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center bg-stone-100 rounded-full">
            <button
              type="button"
              onClick={() => updateQuantity(item.sku, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center font-jakarta text-sm text-stone-600"
            >
              −
            </button>
            <span className="font-jakarta text-sm w-6 text-center">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.sku, item.quantity + 1)}
              disabled={item.quantity >= item.maxStock}
              className="w-8 h-8 flex items-center justify-center font-jakarta text-sm text-stone-600 disabled:opacity-30"
            >
              +
            </button>
          </div>
          <span className="font-grotesk text-sm font-medium">
            {formatPrice(item.unitPrice * item.quantity)}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => removeItem(item.sku)}
        className="self-start w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-xs text-stone-400 hover:text-coral hover:bg-stone-200 transition-colors shrink-0"
      >
        ✕
      </button>
    </motion.div>
  );
}

export function CartDrawer() {
  const { items, isOpen, closeCart, totalPrice } = useCartStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blurred backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-stone-900/30 backdrop-blur-md"
            onClick={closeCart}
          />

          {/* Cart overlay */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex flex-col pointer-events-none pt-24 pb-8 px-4 md:px-8"
          >
            <div className="w-full max-w-lg mx-auto flex flex-col gap-4 max-h-full pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-2">
                <h2 className="font-jakarta font-bold text-xs uppercase tracking-wider text-white">
                  Кошик
                </h2>
                <button
                  onClick={closeCart}
                  className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  type="button"
                >
                  ✕
                </button>
              </div>

              {/* Items list */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 scrollbar-none">
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl shadow-soft p-8 text-center"
                  >
                    <p className="text-sm text-stone-400">Кошик порожній</p>
                  </motion.div>
                ) : (
                  items.map((item, i) => (
                    <CartCard key={item.sku} item={item} index={i} />
                  ))
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl shadow-soft p-5 flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-jakarta font-bold text-xs uppercase tracking-wider">
                      Разом
                    </span>
                    <span className="font-grotesk text-xl font-medium">
                      {formatPrice(totalPrice())}
                    </span>
                  </div>
                  <Link href="/checkout" onClick={closeCart}>
                    <PrecisionButton className="w-full">
                      Оформити замовлення
                    </PrecisionButton>
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
