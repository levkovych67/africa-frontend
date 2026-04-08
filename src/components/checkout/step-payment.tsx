"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { CartItem } from "@/store/cart";
import { PaymentMethod } from "@/types/order";
import { formatPrice } from "@/lib/utils/price";
import { cn } from "@/lib/cn";
import { PrecisionButton } from "@/components/ui/precision-button";
import { OrderSummary } from "./order-summary";

interface StepPaymentProps {
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

/* ─── Nova Poshta icon (inline SVG) ───────────────────────────────── */

function NovaPoshtaIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

/* ─── Payment card component ──────────────────────────────────────── */

function PaymentCard({
  selected,
  onSelect,
  icon,
  title,
  subtitle,
  badge,
}: {
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "relative w-full text-left p-5 rounded-2xl border-2 transition-colors duration-300",
        selected ? "border-stone-900 bg-white shadow-soft" : "border-stone-200/70 bg-white/60 hover:border-stone-300"
      )}
    >
      {/* Selection indicator */}
      <div className="flex items-center gap-4">
        {/* Radio dot */}
        <div className="relative flex-shrink-0">
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 transition-colors duration-300 flex items-center justify-center",
              selected ? "border-stone-900" : "border-stone-300"
            )}
          >
            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 25,
                  }}
                  className="w-2.5 h-2.5 rounded-full bg-stone-900"
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Icon */}
        <div
          className={cn(
            "flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-300",
            selected ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500"
          )}
        >
          {icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-jakarta font-semibold transition-colors duration-300",
                selected ? "text-stone-900" : "text-stone-700"
              )}
            >
              {title}
            </span>
            {badge && (
              <span className="px-2 py-0.5 rounded-full bg-emerald/10 text-emerald text-[10px] font-jakarta font-bold uppercase tracking-wider">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Active glow effect */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 rounded-2xl ring-1 ring-stone-900/5 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ─── Main component ──────────────────────────────────────────────── */

export function StepPayment({
  items,
  total,
  paymentMethod,
  onPaymentMethodChange,
  onSubmit,
  isLoading,
}: StepPaymentProps) {
  return (
    <div className="py-8">
      <h2 className="font-jakarta font-bold text-xs uppercase tracking-widest mb-6">
        <span className="font-grotesk">03</span> / Оплата
      </h2>

      <OrderSummary items={items} />

      {/* Total */}
      <div className="flex items-center justify-between py-6 border-t border-stone-200/50">
        <span className="font-jakarta font-bold text-xs uppercase tracking-wider">
          Разом
        </span>
        <span className="font-grotesk text-xl">{formatPrice(total)}</span>
      </div>

      {/* Payment method label */}
      <p className="label-section mb-3">
        Спосіб оплати
      </p>

      {/* Payment methods */}
      <motion.div
        className="space-y-3 mb-8"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08 } },
        }}
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { type: "spring", stiffness: 300, damping: 30 },
            },
          }}
        >
          <PaymentCard
            method="COD"
            selected={paymentMethod === "COD"}
            onSelect={() => onPaymentMethodChange("COD")}
            icon={<NovaPoshtaIcon className="w-5 h-5" />}
            title="Оплата при отриманні"
            subtitle="Накладений платіж (Нова Пошта)"
          />
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { type: "spring", stiffness: 300, damping: 30 },
            },
          }}
        >
          <PaymentCard
            method="ONLINE"
            selected={paymentMethod === "ONLINE"}
            onSelect={() => onPaymentMethodChange("ONLINE")}
            icon={
              <Image
                src="/images/monobank.svg"
                alt="Monobank"
                width={34}
                height={34}
                className={cn("transition-all duration-300", paymentMethod === "ONLINE" && "brightness-0 invert")}
              />
            }
            title="Оплатити онлайн"
            subtitle="Monobank (Visa / Mastercard)"
          />
        </motion.div>
      </motion.div>

      {/* Info message based on selection */}
      <AnimatePresence mode="wait">
        <motion.p
          key={paymentMethod}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-stone-400 mb-6 text-center"
        >
          {paymentMethod === "ONLINE"
            ? "Ви будете перенаправлені на сторінку Monobank для оплати"
            : "Оплата готівкою або карткою при отриманні посилки"}
        </motion.p>
      </AnimatePresence>

      <PrecisionButton
        onClick={onSubmit}
        loading={isLoading}
        className="w-full"
      >
        {paymentMethod === "ONLINE"
          ? "Перейти до оплати"
          : "Оформити замовлення"}
      </PrecisionButton>
    </div>
  );
}
