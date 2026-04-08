import { CartItem } from "@/store/cart";
import { formatPrice } from "@/lib/utils/price";

interface OrderSummaryProps {
  items: CartItem[];
}

export function OrderSummary({ items }: OrderSummaryProps) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <div key={item.sku} className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium">{item.productTitle}</p>
            <p className="font-grotesk text-xs text-stone-500">
              {item.variantLabel} x {item.quantity}
            </p>
          </div>
          <span className="font-grotesk text-sm">
            {formatPrice(item.unitPrice * item.quantity)}
          </span>
        </div>
      ))}
    </div>
  );
}

