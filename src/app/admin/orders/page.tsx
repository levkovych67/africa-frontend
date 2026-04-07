"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminOrders } from "@/hooks/use-admin-orders";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { OrderStatus } from "@/types/admin";
import { formatPrice } from "@/lib/utils/price";

const STATUS_OPTIONS: { value: OrderStatus | ""; label: string }[] = [
  { value: "", label: "Всі" },
  { value: "WAITING_PAYMENT", label: "Очікує оплати" },
  { value: "PENDING", label: "Нове" },
  { value: "CONFIRMED", label: "Підтверджено" },
  { value: "SHIPPED", label: "Відправлено" },
  { value: "DELIVERED", label: "Доставлено" },
  { value: "CANCELLED", label: "Скасовано" },
];

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

export default function AdminOrdersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [page, setPage] = useState(0);

  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, error } = useAdminOrders({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    page,
    size: 20,
    sort: "createdAt,desc",
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("uk-UA");
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Замовлення</h1>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Пошук за email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as OrderStatus | "");
            setPage(0);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-gray-500 text-sm">Завантаження...</p>}
      {error && (
        <p className="text-red-600 text-sm">Помилка завантаження замовлень</p>
      )}

      {data && (
        <>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Клієнт
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Телефон
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Сума
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Статус
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Оплата
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Доставка
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Дата
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-3 text-gray-900">
                      {order.firstName} {order.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.email}</td>
                    <td className="px-4 py-3 text-gray-600">{order.phone}</td>
                    <td className="px-4 py-3 text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${STATUS_BADGE[order.status]}`}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {order.paymentMethod === "ONLINE" && order.status !== "WAITING_PAYMENT" ? (
                        <span className="inline-block px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800">
                          Оплачено
                        </span>
                      ) : order.paymentMethod === "ONLINE" ? (
                        <span className="inline-block px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                          Очікує
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">Накладний</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {order.shippingDetails.city},{" "}
                      {order.shippingDetails.warehouseDescription}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
                {data.content.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Замовлень не знайдено
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={data.first}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Попередня
            </button>
            <span className="text-sm text-gray-600">
              Сторінка {data.number + 1} з {data.totalPages || 1}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={data.last}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Наступна
            </button>
          </div>
        </>
      )}
    </div>
  );
}
