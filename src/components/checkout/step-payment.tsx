"use client";

import { CartItem } from "@/store/cart";
import { formatPrice } from "@/lib/utils/price";
import { PrecisionButton } from "@/components/ui/precision-button";
import { OrderSummary } from "./order-summary";

interface StepPaymentProps {
  items: CartItem[];
  total: number;
  onSubmit: () => void;
  isLoading: boolean;
}

export function StepPayment({ items, total, onSubmit, isLoading }: StepPaymentProps) {
  return (
    <div className="py-8">
      <h2 className="font-jakarta font-bold text-xs uppercase tracking-widest mb-6">
        <span className="font-grotesk">03</span> / Оплата
      </h2>

      <OrderSummary items={items} />

      <div className="flex items-center justify-between py-6 border-t border-stone-200/50">
        <span className="font-jakarta font-bold text-xs uppercase tracking-wider">
          Разом
        </span>
        <span className="font-grotesk text-xl">{formatPrice(total)}</span>
      </div>

      <p className="text-sm text-stone-500 mb-6">
        Оплата при отриманні (накладений платіж)
      </p>

      <PrecisionButton
        onClick={onSubmit}
        loading={isLoading}
        className="w-full"
      >
        Оформити замовлення
      </PrecisionButton>
    </div>
  );
}
