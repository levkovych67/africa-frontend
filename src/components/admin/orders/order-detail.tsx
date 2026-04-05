"use client";

import { useState } from "react";
import { AdminOrder, OrderStatus } from "@/types/admin";
import { useUpdateOrderStatus } from "@/hooks/use-admin-orders";
import { formatPrice } from "@/lib/utils/price";

const STATUS_BADGE: Record<OrderStatus, string> = {
  WAITING_PAYMENT: "bg-orange-100 text-orange-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  WAITING_PAYMENT: "Очікує оплати",
  PENDING: "Нове",
  CONFIRMED: "Підтверджено",
  SHIPPED: "Відправлено",
  DELIVERED: "Доставлено",
  CANCELLED: "Скасовано",
};

function TtnModal({
  onConfirm,
  onCancel,
  isPending,
}: {
  onConfirm: (ttn: string) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [ttn, setTtn] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmed = ttn.trim();
    if (!trimmed) {
      setError("Введіть номер ТТН");
      return;
    }
    if (!/^\d{14}$/.test(trimmed)) {
      setError("ТТН має містити 14 цифр");
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Номер ТТН (Нова Пошта)
        </h3>
        <input
          type="text"
          value={ttn}
          onChange={(e) => {
            setTtn(e.target.value.replace(/\D/g, "").slice(0, 14));
            if (error) setError("");
          }}
          placeholder="20450000000000"
          className={`w-full border rounded-lg px-4 py-3 text-sm font-mono outline-none transition-colors ${
            error
              ? "border-red-300 focus:ring-2 focus:ring-red-500"
              : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          }`}
          autoFocus
          inputMode="numeric"
        />
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Скасувати
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Збереження..." : "Відправлено"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusActions({
  order,
  updateStatus,
  onShipClick,
}: {
  order: AdminOrder;
  updateStatus: ReturnType<typeof useUpdateOrderStatus>;
  onShipClick: () => void;
}) {
  const confirm = (status: OrderStatus) => {
    if (
      !window.confirm(
        `Змінити статус на "${STATUS_LABELS[status]}"?`
      )
    )
      return;
    updateStatus.mutate({ id: order.id, status });
  };

  const isPending = updateStatus.isPending;

  switch (order.status) {
    case "WAITING_PAYMENT":
      return (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Очікує оплати</span>
          <button
            type="button"
            onClick={() => confirm("CANCELLED")}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            Відмінити
          </button>
        </div>
      );

    case "PENDING":
      return (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => confirm("CONFIRMED")}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Підтвердити
          </button>
          <button
            type="button"
            onClick={() => confirm("CANCELLED")}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            Відмінити
          </button>
        </div>
      );

    case "CONFIRMED":
      return (
        <button
          type="button"
          onClick={onShipClick}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          Відправлено
        </button>
      );

    case "SHIPPED":
      return (
        <button
          type="button"
          onClick={() => confirm("DELIVERED")}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          Доставлено
        </button>
      );

    default:
      return null;
  }
}

export function OrderDetail({ order }: { order: AdminOrder }) {
  const [showTtnModal, setShowTtnModal] = useState(false);
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

  const handleShipWithTtn = (ttn: string) => {
    updateStatus.mutate(
      { id: order.id, status: "SHIPPED", trackingNumber: ttn },
      { onSuccess: () => setShowTtnModal(false) }
    );
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
        <div className="flex items-center gap-2">
          {order.paymentMethod === "ONLINE" && order.status !== "WAITING_PAYMENT" && (
            <span className="px-3 py-1 rounded-md text-sm font-medium bg-emerald-100 text-emerald-800">
              Оплачено
            </span>
          )}
          <span
            className={`px-3 py-1 rounded-md text-sm font-medium ${STATUS_BADGE[order.status]}`}
          >
            {STATUS_LABELS[order.status]}
          </span>
        </div>
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
          <div>
            <span className="text-gray-500">Оплата:</span>{" "}
            <span className="text-gray-900">
              {order.paymentMethod === "ONLINE" ? "Онлайн (Monobank)" : "При отриманні"}
            </span>
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
              <span className="text-gray-500">ТТН:</span>{" "}
              <span className="text-gray-900 font-mono">
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

      {/* Status actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Керування замовленням
        </h3>
        <StatusActions
          order={order}
          updateStatus={updateStatus}
          onShipClick={() => setShowTtnModal(true)}
        />
        {updateStatus.isError && (
          <p className="text-sm text-red-600 mt-2">
            Помилка оновлення статусу
          </p>
        )}
        {updateStatus.isSuccess && (
          <p className="text-sm text-green-600 mt-2">Статус оновлено</p>
        )}
      </div>

      {/* TTN Modal */}
      {showTtnModal && (
        <TtnModal
          onConfirm={handleShipWithTtn}
          onCancel={() => setShowTtnModal(false)}
          isPending={updateStatus.isPending}
        />
      )}
    </div>
  );
}
