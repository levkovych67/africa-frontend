"use client";

import { FadeImage } from "@/components/ui/fade-image";
import { CartItem, useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils/price";

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-4">
      <div className="relative h-24 w-20 shrink-0 rounded-lg overflow-hidden shimmer-bg">
        {item.image && (
          <FadeImage
            src={item.image}
            alt={item.productTitle}
            fill
            className="object-cover"
            sizes="80px"
            quality={50}
          />
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="text-sm font-medium">{item.productTitle}</p>
          <p className="font-grotesk text-xs text-stone-500">
            {item.variantLabel}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-stone-100 rounded-full">
            <button
              type="button"
              onClick={() => updateQuantity(item.sku, item.quantity - 1)}
              className="px-3 py-1 font-jakarta text-sm"
            >
              −
            </button>
            <span className="font-jakarta text-sm">{item.quantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(item.sku, item.quantity + 1)}
              className="px-3 py-1 font-jakarta text-sm"
            >
              +
            </button>
          </div>
          <span className="font-grotesk text-sm">
            {formatPrice(item.unitPrice * item.quantity)}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => removeItem(item.sku)}
        className="self-start text-xs text-stone-400 hover:text-coral"
      >
        X
      </button>
    </div>
  );
}
