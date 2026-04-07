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

/* ─── Mini icon components ─── */
function IconPackage() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconMessage() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function IconArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

/* ─── Skeleton loader ─── */
function OrderSkeleton() {
  return (
    <div className="max-w-[620px] mx-auto px-6 py-16">
      <div className="flex flex-col items-center mb-12">
        <div className="w-20 h-20 rounded-full bg-stone-100 animate-pulse mb-6" />
        <div className="h-7 w-44 bg-stone-100 animate-pulse rounded-full mb-3" />
        <div className="h-4 w-56 bg-stone-100 animate-pulse rounded-full" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-stone-100 animate-pulse rounded-2xl" />
        ))}
      </div>
    </div>
  );
}



/* ─── Stagger animation helpers ─── */
const stagger = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.15 + i * 0.08, type: "spring" as const, stiffness: 300, damping: 30 },
});

/* ─── Main component ─── */
export function OrderTracker({ orderId, accessToken }: OrderTrackerProps) {
  const { data: order, isLoading, error } = useOrder(orderId, accessToken);

  if (isLoading) return <OrderSkeleton />;

  if (error || !order) {
    return (
      <div className="max-w-[620px] mx-auto px-6 py-24 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="mx-auto w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mb-6"
        >
          <span className="text-3xl text-stone-300">?</span>
        </motion.div>
        <p className="font-jakarta font-semibold text-stone-500 mb-6">
          Замовлення не знайдено
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors"
        >
          <IconArrowLeft /> Повернутися до магазину
        </Link>
      </div>
    );
  }


  return (
    <div className="bg-pearl pb-12 md:pb-16 min-h-[calc(100vh-64px)]">
      {/* ─── Thematic Hero Banner ─── */}
      <div className="relative w-full h-[35vh] min-h-[260px] md:min-h-[300px] mb-8 bg-stone-900 border-b border-stone-200/50 flex flex-col items-center justify-end overflow-hidden">
        <Image
          src="/images/OrderPage.webp"
          alt="AFRICA SHOP"
          fill
          priority
          className="object-cover opacity-50 mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pearl via-pearl/40 to-stone-900/40" />

        <motion.div
          className="relative z-10 flex flex-col items-center text-center px-4 pb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Animated check circle */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            className="w-[72px] h-[72px] rounded-full bg-white/60 backdrop-blur-md shadow-soft flex items-center justify-center mb-6 relative"
          >
            <motion.svg
              width="32"
              height="32"
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
              className="absolute inset-0 rounded-full border border-emerald/30"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.5, delay: 0.6, ease: "easeOut", repeat: Infinity, repeatDelay: 3 }}
            />
          </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 30 }}
          className="font-jakarta font-bold text-2xl tracking-tight mb-2"
        >
          Ваше замовлення
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, type: "spring", stiffness: 300, damping: 30 }}
          className="flex items-center gap-3 text-stone-800"
        >
          <span className="font-grotesk text-sm text-stone-400 tracking-wide">
            #{orderId.slice(0, 8)}…
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

         
        </motion.div>
      </div>

      <div className="max-w-[620px] mx-auto px-6">
        {/* ─── Items card ─── */}
      <motion.div
        {...stagger(0)}
        className="bg-white rounded-2xl shadow-soft overflow-hidden mb-4"
      >
        <div className="px-5 py-4 flex items-center gap-3 border-b border-stone-100">
          <span className="text-stone-400"><IconPackage /></span>
          <h3 className="font-jakarta font-bold text-xs uppercase tracking-widest text-stone-400">
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
                  {item.variantName || "—"}
                  <span className="font-grotesk"> × {item.quantity}</span>
                </p>
              </div>
              <span className="font-grotesk text-sm font-medium text-stone-900 shrink-0 tabular-nums">
                {formatPrice(item.unitPrice * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 bg-stone-50/80 flex items-center justify-between">
          <span className="font-jakarta font-bold text-xs uppercase tracking-wider text-stone-400">
            Разом
          </span>
          <span className="font-grotesk text-lg font-semibold text-stone-900 tabular-nums">
            {formatPrice(order.totalAmount)}
          </span>
        </div>
      </motion.div>

      {/* ─── Info cards grid ─── */}
      <motion.div
        {...stagger(1)}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4"
      >
        {/* Shipping */}
        <div className="bg-white rounded-2xl shadow-soft p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="text-stone-400"><IconTruck /></span>
            <h3 className="label-section">
              Доставка
            </h3>
          </div>
          <p className="text-sm font-medium text-stone-900">
            {order.shippingDetails?.carrier || "Нова Пошта"}
          </p>
          <p className="text-sm text-stone-500 mt-1">
            {order.shippingDetails?.city}
          </p>
          <p className="text-sm text-stone-500">
            {order.shippingDetails?.warehouseDescription}
          </p>
          {order.shippingDetails?.trackingNumber && (
            <div className="mt-3 px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-100">
              <p className="text-[10px] font-jakarta font-bold uppercase tracking-wider text-stone-400 mb-1">
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
            <span className="text-stone-400"><IconUser /></span>
            <h3 className="label-section">
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

      {/* ─── Comment ─── */}
      {order.comment && (
        <motion.div
          {...stagger(2)}
          className="bg-white rounded-2xl shadow-soft p-5 mb-4"
        >
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-stone-400"><IconMessage /></span>
            <h3 className="label-section">
              Коментар
            </h3>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">{order.comment}</p>
        </motion.div>
      )}

      {/* ─── Back link ─── */}
      <motion.div
        {...stagger(3)}
        className="flex justify-center pt-6"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-stone-900 transition-colors duration-200"
        >
          <IconArrowLeft />
          <span className="font-jakarta font-medium">Повернутися до магазину</span>
        </Link>
      </motion.div>
    </div>
    </div>
  );
}
