"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useOrder } from "@/hooks/use-checkout";
import { formatPrice } from "@/lib/utils/price";

interface OrderTrackerProps {
  orderId: string;
  accessToken?: string;
}

/* ─── Refined icon set — thin geometric style matching site aesthetic ─── */
function IconPackage() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 10-16 0" />
    </svg>
  );
}

function IconMessage() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  );
}

function IconArrowLeft() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

/* ─── Skeleton loader ─── */
function OrderSkeleton() {
  return (
    <div className="bg-pearl min-h-[calc(100vh-64px)]">
      <div className="relative flex items-center justify-center py-16 overflow-hidden">
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-stone-100 animate-pulse mb-6" />
          <div className="h-3 w-16 bg-stone-100 animate-pulse rounded-full mb-5" />
          <div className="h-8 w-48 bg-stone-100 animate-pulse rounded-full mb-3" />
          <div className="h-4 w-56 bg-stone-100 animate-pulse rounded-full" />
        </div>
      </div>
      <div className="max-w-[620px] mx-auto px-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-stone-100 animate-pulse rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

/* ─── Stagger animation helpers ─── */
const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.5 + i * 0.1, type: "spring" as const, stiffness: 300, damping: 30 },
});

/* ─── Main component ─── */
export function OrderTracker({ orderId, accessToken }: OrderTrackerProps) {
  const { data: order, isLoading, error } = useOrder(orderId, accessToken);

  if (isLoading) return <OrderSkeleton />;

  if (error || !order) {
    return (
      <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center bg-pearl px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, rotate: -8, scale: 0.9 }}
          animate={{ opacity: 0.03, rotate: -12, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute pointer-events-none select-none"
        >
          <Image src="/images/logov2.webp" alt="" width={800} height={800} className="w-[70vw] md:w-[500px] h-auto" />
        </motion.div>

        <div className="relative z-10 text-center max-w-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mx-auto w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mb-6"
          >
            <span className="font-grotesk text-2xl text-stone-300">?</span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.12em" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-grotesk text-[11px] text-coral font-semibold uppercase tracking-widest mb-6"
          >
            Не знайдено
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 250, damping: 25 }}
            className="text-h2-section mb-4"
          >
            Замовлення не знайдено
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            className="text-sm text-stone-500 leading-relaxed mb-10"
          >
            Перевірте посилання або зверніться до підтримки
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, type: "spring", stiffness: 300, damping: 30 }}
          >
            <Link
              href="/"
              className="rounded-full py-3.5 px-8 font-jakarta font-bold text-xs uppercase tracking-wider bg-stone-900 text-white hover:scale-[1.02] hover:shadow-lift active:scale-[0.97] transition-all duration-200 ease-out inline-block"
            >
              На головну
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <div className="bg-pearl min-h-[calc(100vh-64px)]">
      {/* ─── Hero section — matching success/error page style ─── */}
      <div className="relative flex items-center justify-center py-14 md:py-20 overflow-hidden">
        {/* Background Africa silhouette watermark */}
        <motion.div
          initial={{ opacity: 0, rotate: 8, scale: 0.9 }}
          animate={{ opacity: 0.025, rotate: 12, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute pointer-events-none select-none"
        >
          <Image src="/images/logov2.webp" alt="" width={800} height={800} className="w-[70vw] md:w-[500px] h-auto" />
        </motion.div>

        <div className="relative z-10 flex flex-col items-center text-center px-6">
          {/* Animated check circle */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-emerald/10 flex items-center justify-center mb-6 relative"
          >
            <motion.svg
              width="34"
              height="34"
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
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full border border-emerald/20"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1.8, delay: 0.6, ease: "easeOut", repeat: Infinity, repeatDelay: 4 }}
            />
          </motion.div>

          {/* Status label — glitch-style */}
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.12em" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-grotesk text-[11px] text-emerald font-semibold uppercase tracking-widest mb-5"
          >
            {order.paymentMethod === "COD"
              ? "Оплата при отриманні"
              : order.status === "WAITING_PAYMENT"
                ? "Очікує оплати"
                : "Оплачено"}
          </motion.p>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 250, damping: 25 }}
            className="text-h2-section mb-4"
          >
            Ваше замовлення
          </motion.h1>

          {/* Order meta */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            className="flex items-center gap-3"
          >
            <span className="inline-block px-3.5 py-1.5 bg-stone-100 rounded-full font-grotesk text-xs text-stone-500 tracking-wide">
              #{orderId.slice(0, 10)}…
            </span>
            <span className="text-stone-200">·</span>
            <span className="text-sm text-stone-400">
              {new Date(order.createdAt).toLocaleDateString("uk-UA", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </motion.div>
        </div>
      </div>

      {/* ─── Content cards ─── */}
      <div className="max-w-[620px] mx-auto px-6 pb-16">
        {/* Items card */}
        <motion.div
          {...stagger(0)}
          className="bg-white rounded-2xl shadow-soft overflow-hidden mb-4"
        >
          <div className="px-5 py-4 flex items-center gap-3 border-b border-stone-100">
            <span className="text-stone-300"><IconPackage /></span>
            <h3 className="font-jakarta font-bold text-[10px] uppercase tracking-[0.08em] text-stone-400">
              Товари
            </h3>
          </div>
          <div className="divide-y divide-stone-50">
            {order.items.map((item, i) => (
              <div key={i} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-stone-900 truncate">
                    {item.productTitle}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {item.variantName ? `${item.variantName} ` : ""}
                    <span className="font-grotesk">&times; {item.quantity}</span>
                  </p>
                </div>
                <span className="font-grotesk text-sm font-medium text-stone-900 shrink-0 tabular-nums">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 bg-stone-50/60 flex items-center justify-between border-t border-stone-100">
            <span className="font-jakarta font-bold text-[10px] uppercase tracking-[0.08em] text-stone-400">
              Разом
            </span>
            <span className="font-grotesk text-lg font-semibold text-stone-900 tabular-nums">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </motion.div>

        {/* Info cards grid */}
        <motion.div
          {...stagger(1)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4"
        >
          {/* Shipping */}
          <div className="bg-white rounded-2xl shadow-soft p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-stone-300"><IconMapPin /></span>
              <h3 className="font-jakarta font-bold text-[10px] uppercase tracking-[0.08em] text-stone-400">
                Доставка
              </h3>
            </div>
            <p className="text-sm font-medium text-stone-900">
              {order.shippingDetails?.carrier || "Нова Пошта"}
            </p>
            <p className="text-sm text-stone-500 mt-1">
              {order.shippingDetails?.city}
            </p>
            <p className="text-sm text-stone-500 leading-relaxed">
              {order.shippingDetails?.warehouseDescription}
            </p>
            {order.shippingDetails?.trackingNumber && (
              <div className="mt-3 px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-100">
                <p className="text-[10px] font-jakarta font-bold uppercase tracking-[0.08em] text-stone-400 mb-1">
                  ТТН
                </p>
                <p className="font-grotesk text-sm font-medium text-stone-900 tracking-wide tabular-nums">
                  {order.shippingDetails?.trackingNumber}
                </p>
              </div>
            )}
          </div>

          {/* Contacts */}
          <div className="bg-white rounded-2xl shadow-soft p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-stone-300"><IconUser /></span>
              <h3 className="font-jakarta font-bold text-[10px] uppercase tracking-[0.08em] text-stone-400">
                Контакти
              </h3>
            </div>
            <p className="text-sm font-medium text-stone-900">
              {order.firstName} {order.lastName}
            </p>
            <p className="text-sm text-stone-500 mt-1">{order.email}</p>
            <p className="text-sm text-stone-500">{order.phone}</p>
          </div>
        </motion.div>

        {/* Comment */}
        {order.comment && (
          <motion.div
            {...stagger(2)}
            className="bg-white rounded-2xl shadow-soft p-5 mb-4"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-stone-300"><IconMessage /></span>
              <h3 className="font-jakarta font-bold text-[10px] uppercase tracking-[0.08em] text-stone-400">
                Коментар
              </h3>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">{order.comment}</p>
          </motion.div>
        )}

        {/* Back link */}
        <motion.div
          {...stagger(3)}
          className="flex justify-center pt-8"
        >
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm text-stone-400 hover:text-stone-900 transition-colors duration-200"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-0.5"><IconArrowLeft /></span>
            <span className="font-jakarta font-medium">Повернутися до магазину</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
