"use client";

import { useState } from "react";
import { AdminOrder, OrderStatus } from "@/types/admin";
import { useUpdateOrderStatus } from "@/hooks/use-admin-orders";
import { formatPrice } from "@/lib/utils/price";

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export function OrderDetail({ order }: { order: AdminOrder }) {
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);
  const updateStatus = useUpdateOrderStatus();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusUpdate = () => {
    if (newStatus === order.status) return;
    if (!window.confirm(`Змінити статус на ${newStatus}?`)) return;
    updateStatus.mutate({ id: order.id, status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Замовлення #{order.id.slice(0, 8)}
          </h2>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-md text-sm font-medium ${STATUS_BADGE[order.status]}`}
        >
          {order.status}
        </span>
      </div>

      {/* Customer info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Інформація про клієнта
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Ім&apos;я:</span>{" "}
            <span className="text-gray-900">
              {order.firstName} {order.lastName}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Email:</span>{" "}
            <span className="text-gray-900">{order.email}</span>
          </div>
          <div>
            <span className="text-gray-500">Телефон:</span>{" "}
            <span className="text-gray-900">{order.phone}</span>
          </div>
        </div>
      </div>

      {/* Shipping */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Доставка</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Місто:</span>{" "}
            <span className="text-gray-900">
              {order.shippingDetails.city}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Відділення:</span>{" "}
            <span className="text-gray-900">
              {order.shippingDetails.warehouseDescription}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Перевізник:</span>{" "}
            <span className="text-gray-900">
              {order.shippingDetails.carrier}
            </span>
          </div>
          {order.shippingDetails.trackingNumber && (
            <div>
              <span className="text-gray-500">Трекінг:</span>{" "}
              <span className="text-gray-900">
                {order.shippingDetails.trackingNumber}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Comment */}
      {order.comment && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Коментар</h3>
          <p className="text-sm text-gray-600">{order.comment}</p>
        </div>
      )}

      {/* Items table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <h3 className="text-sm font-medium text-gray-900 px-4 py-3 border-b border-gray-200">
          Товари
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2 font-medium text-gray-500">
                Товар
              </th>
              <th className="text-left px-4 py-2 font-medium text-gray-500">
                SKU
              </th>
              <th className="text-left px-4 py-2 font-medium text-gray-500">
                Варіант
              </th>
              <th className="text-right px-4 py-2 font-medium text-gray-500">
                К-сть
              </th>
              <th className="text-right px-4 py-2 font-medium text-gray-500">
                Ціна
              </th>
              <th className="text-right px-4 py-2 font-medium text-gray-500">
                Сума
              </th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="px-4 py-2 text-gray-900">
                  {item.productTitle}
                </td>
                <td className="px-4 py-2 text-gray-600 font-mono text-xs">
                  {item.sku}
                </td>
                <td className="px-4 py-2 text-gray-600">{item.variantName}</td>
                <td className="px-4 py-2 text-right text-gray-900">
                  {item.quantity}
                </td>
                <td className="px-4 py-2 text-right text-gray-600">
                  {formatPrice(item.unitPrice)}
                </td>
                <td className="px-4 py-2 text-right text-gray-900">
                  {formatPrice(item.unitPrice * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td
                colSpan={5}
                className="px-4 py-3 text-right font-medium text-gray-900"
              >
                Всього:
              </td>
              <td className="px-4 py-3 text-right font-semibold text-gray-900">
                {formatPrice(order.totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Status update */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Оновити статус
        </h3>
        <div className="flex items-center gap-3">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleStatusUpdate}
            disabled={updateStatus.isPending || newStatus === order.status}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateStatus.isPending ? "Оновлення..." : "Оновити статус"}
          </button>
        </div>
        {updateStatus.isError && (
          <p className="text-sm text-red-600 mt-2">
            Помилка оновлення статусу
          </p>
        )}
        {updateStatus.isSuccess && (
          <p className="text-sm text-green-600 mt-2">Статус оновлено</p>
        )}
      </div>
    </div>
  );
}
