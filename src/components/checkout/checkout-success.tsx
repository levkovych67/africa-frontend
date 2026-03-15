"use client";

import Link from "next/link";
import { PrecisionButton } from "@/components/ui/precision-button";

interface CheckoutSuccessProps {
  orderId: string;
}

export function CheckoutSuccess({ orderId }: CheckoutSuccessProps) {
  return (
    <div className="max-w-[600px] mx-auto px-6 py-20 text-center">
      <h1 className="font-jakarta text-2xl font-bold mb-4">
        Дякуємо!
      </h1>
      <p className="text-sm mb-2">Ваше замовлення прийнято.</p>
      <p className="font-grotesk text-sm text-stone-500 mb-8">
        Номер замовлення: {orderId}
      </p>
      <Link href="/">
        <PrecisionButton>Повернутися до магазину</PrecisionButton>
      </Link>
    </div>
  );
}
