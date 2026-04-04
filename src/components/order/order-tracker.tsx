"use client";

import { motion } from "framer-motion";
import { useOrder } from "@/hooks/use-checkout";
import { formatPrice } from "@/lib/utils/price";

const STATUS_LABELS: Record<string, string> = {
  WAITING_PAYMENT: "Очікує оплати",
  PENDING: "Очікує підтвердження",
  CONFIRMED: "Підтверджено",
  SHIPPED: "Відправлено",
  DELIVERED: "Доставлено",
  CANCELLED: "Скасовано",
};

const STATUS_STEPS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

interface OrderTrackerProps {
  orderId: string;
}

export function OrderTracker({ orderId }: OrderTrackerProps) {
  const { data: order, isLoading, error } = useOrder(orderId);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="h-6 w-40 bg-stone-100 animate-pulse rounded-full mb-3" />
        <div className="h-4 w-56 bg-stone-100 animate-pulse rounded-full mb-10" />
        <div className="flex gap-2 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-1 h-2 bg-stone-100 animate-pulse rounded-full" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 bg-stone-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="font-grotesk text-5xl text-stone-200 font-bold mb-4">?</p>
        <p className="text-sm text-stone-500">Замовлення не знайдено</p>
      </div>
    );
  }

  const isCancelled = order.status === "CANCELLED";
  const isWaitingPayment = order.status === "WAITING_PAYMENT";
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <motion.div
      className="max-w-2xl mx-auto px-6 py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <h1 className="font-jakarta font-bold text-xl tracking-tight mb-1">
        Замовлення
      </h1>
      <p className="text-sm text-stone-500 mb-8">
        <span className="font-grotesk">#{orderId.slice(0, 8)}…</span>
        {" "}&middot;{" "}
        {new Date(order.createdAt).toLocaleDateString("uk-UA")}
      </p>

      {/* Status */}
      {isCancelled ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-coral/8 border border-coral/15 rounded-2xl p-5 mb-8"
        >
          <p className="text-sm font-jakarta font-semibold text-coral">
            Замовлення скас��вано
          </p>
        </motion.div>
      ) : isWaitingPayment ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-50 border border-amber-200/50 rounded-2xl p-5 mb-8"
        >
          <p className="text-sm font-jakarta font-semibold text-amber-700">
            Очікує оплати
          </p>
          <p className="text-xs text-amber-600/70 mt-1">
            Після оплати статус оновиться автоматично
          </p>
        </motion.div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="flex items-center gap-1.5 mb-3">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex-1 h-2 rounded-full overflow-hidden bg-stone-100">
                {i <= currentStepIndex && (
                  <motion.div
                    className="h-full bg-stone-900 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.15,
                      ease: "easeOut",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step labels */}
          <div className="flex gap-1.5 mb-8">
            {STATUS_STEPS.map((step, i) => (
              <p
                key={step}
                className={`flex-1 text-[10px] font-jakarta font-bold uppercase tracking-wider ${
                  i <= currentStepIndex ? "text-stone-900" : "text-stone-300"
                }`}
              >
                {STATUS_LABELS[step]}
              </p>
            ))}
          </div>
        </>
      )}

      {/* Items */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-2xl shadow-soft overflow-hidden mb-6"
      >
        <div className="px-5 py-4 border-b border-stone-100">
          <h3 className="font-jakarta font-bold text-xs uppercase tracking-widest text-stone-400">
            Товари
          </h3>
        </div>
        <div className="divide-y divide-stone-100">
          {order.items.map((item, i) => (
            <div key={i} className="px-5 py-4 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-stone-900 truncate">
                  {item.productTitle}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  {item.variantName || "—"}
                  <span className="font-grotesk"> x {item.quantity}</span>
                </p>
              </div>
              <span className="font-grotesk text-sm text-stone-900 ml-4 shrink-0">
                {formatPrice(item.unitPrice * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 bg-stone-50 flex items-center justify-between">
          <span className="font-jakarta font-bold text-xs uppercase tracking-wider text-stone-500">
            Разом
          </span>
          <span className="font-grotesk text-lg font-medium text-stone-900">
            {formatPrice(order.totalAmount)}
          </span>
        </div>
      </motion.div>

      {/* Details cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 30 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {/* Shipping */}
        <div className="bg-white rounded-2xl shadow-soft p-5">
          <h3 className="font-jakarta font-bold text-[10px] uppercase tracking-[0.08em] text-stone-400 mb-3">
            Доставка
          </h3>
          <p className="text-sm text-stone-900">
            {order.shippingDetails.carrier || "Нова Пошта"}
          </p>
          <p className="text-sm text-stone-500 mt-1">
            {order.shippingDetails.city}
          </p>
          <p className="text-sm text-stone-500">
            {order.shippingDetails.warehouseDescription}
          </p>
          {order.shippingDetails.trackingNumber && (
            <div className="mt-3 px-3 py-2 bg-stone-50 rounded-xl">
              <p className="text-[10px] font-jakarta font-bold uppercase tracking-wider text-stone-400 mb-1">
                ТТН
              </p>
              <p className="font-grotesk text-sm font-medium text-stone-900 tracking-wide">
                {order.shippingDetails.trackingNumber}
              </p>
            </div>
          )}
        </div>

        {/* Contacts */}
        <div className="bg-white rounded-2xl shadow-soft p-5">
          <h3 className="font-jakarta font-bold text-[10px] uppercase tracking-[0.08em] text-stone-400 mb-3">
            Контакти
          </h3>
          <p className="text-sm text-stone-900">
            {order.firstName} {order.lastName}
          </p>
          <p className="text-sm text-stone-500 mt-1">{order.email}</p>
          <p className="text-sm text-stone-500">{order.phone}</p>
        </div>
      </motion.div>

      {/* Comment */}
      {order.comment && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, type: "spring", stiffness: 300, damping: 30 }}
          className="mt-4 bg-white rounded-2xl shadow-soft p-5"
        >
          <h3 className="font-jakarta font-bold text-[10px] uppercase tracking-[0.08em] text-stone-400 mb-2">
            Коментар
          </h3>
          <p className="text-sm text-stone-600">{order.comment}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
