"use client";

import { useOrder } from "@/hooks/use-checkout";
import { formatPrice } from "@/lib/utils/price";

const STATUS_LABELS: Record<string, string> = {
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
        <div className="h-8 w-1/3 bg-stone-100 animate-pulse rounded mb-4" />
        <div className="h-4 w-1/2 bg-stone-100 animate-pulse rounded mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-stone-100 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-sm text-stone-500">Замовлення не знайдено</p>
      </div>
    );
  }

  const isCancelled = order.status === "CANCELLED";
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-1">Замовлення</h1>
      <p className="text-sm text-stone-500 mb-8">
        #{orderId.slice(0, 8)}… &middot;{" "}
        {new Date(order.createdAt).toLocaleDateString("uk-UA")}
      </p>

      {/* Status progress */}
      {isCancelled ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-sm font-medium text-red-800">Замовлення скасовано</p>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-8">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`flex-1 h-2 rounded-full ${
                  i <= currentStepIndex ? "bg-stone-900" : "bg-stone-200"
                }`}
              />
              {i < STATUS_STEPS.length - 1 && <div className="w-1" />}
            </div>
          ))}
        </div>
      )}

      {!isCancelled && (
        <p className="text-sm font-medium mb-8">
          {STATUS_LABELS[order.status] || order.status}
        </p>
      )}

      {/* Order items */}
      <div className="border border-stone-200 rounded-lg overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              <th className="text-left px-4 py-3 font-medium text-stone-500">Товар</th>
              <th className="text-left px-4 py-3 font-medium text-stone-500">Варіант</th>
              <th className="text-right px-4 py-3 font-medium text-stone-500">К-сть</th>
              <th className="text-right px-4 py-3 font-medium text-stone-500">Ціна</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} className="border-b border-stone-100">
                <td className="px-4 py-3">{item.productTitle}</td>
                <td className="px-4 py-3 text-stone-500">{item.variantName || "—"}</td>
                <td className="px-4 py-3 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-right">
                  {formatPrice(item.unitPrice * item.quantity)}
                </td>
              </tr>
            ))}
            <tr className="bg-stone-50">
              <td colSpan={3} className="px-4 py-3 font-medium text-right">Разом</td>
              <td className="px-4 py-3 font-medium text-right">
                {formatPrice(order.totalAmount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Shipping details */}
      <div className="grid grid-cols-2 gap-6 text-sm">
        <div>
          <h3 className="font-medium mb-2">Доставка</h3>
          <p className="text-stone-600">{order.shippingDetails.carrier || "Nova Poshta"}</p>
          <p className="text-stone-600">{order.shippingDetails.city}</p>
          <p className="text-stone-600">{order.shippingDetails.warehouseDescription}</p>
          {order.shippingDetails.trackingNumber && (
            <p className="mt-2 font-medium">
              ТТН: {order.shippingDetails.trackingNumber}
            </p>
          )}
        </div>
        <div>
          <h3 className="font-medium mb-2">Контакти</h3>
          <p className="text-stone-600">
            {order.firstName} {order.lastName}
          </p>
          <p className="text-stone-600">{order.email}</p>
          <p className="text-stone-600">{order.phone}</p>
        </div>
      </div>

      {order.comment && (
        <div className="mt-6 text-sm">
          <h3 className="font-medium mb-1">Коментар</h3>
          <p className="text-stone-600">{order.comment}</p>
        </div>
      )}
    </div>
  );
}
