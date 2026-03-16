"use client";

import { useState } from "react";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { formatPrice } from "@/lib/utils/price";

function getDefaultDates() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

export default function AdminDashboardPage() {
  const defaults = getDefaultDates();
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);

  const { data, isLoading, error } = useDashboardStats(from, to);

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Дашборд</h1>

      {/* Date range */}
      <div className="flex items-center gap-3 mb-6">
        <label className="text-sm text-gray-600">Від:</label>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <label className="text-sm text-gray-600">До:</label>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {isLoading && <p className="text-gray-500 text-sm">Завантаження...</p>}
      {error && (
        <p className="text-red-600 text-sm">Помилка завантаження статистики</p>
      )}

      {data && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500">Дохід</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {formatPrice(data.totalRevenue)}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500">Замовлення</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {data.totalOrders}
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500">Продано одиниць</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {data.totalUnitsSold}
              </p>
            </div>
          </div>

          {/* Revenue by day */}
          {data.revenueByDay.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-3">
                Дохід по днях
              </h2>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-medium text-gray-500">
                        Дата
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">
                        Дохід
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">
                        Замовлення
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.revenueByDay.map((day) => (
                      <tr
                        key={day.date}
                        className="border-b border-gray-100"
                      >
                        <td className="px-4 py-2 text-gray-900">
                          {day.date}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-900">
                          {formatPrice(day.revenue)}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-600">
                          {day.orders}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top products */}
          {data.topProducts.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-3">
                Топ товари
              </h2>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-medium text-gray-500">
                        Товар
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">
                        Продано
                      </th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">
                        Дохід
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((product) => (
                      <tr
                        key={product.productId}
                        className="border-b border-gray-100"
                      >
                        <td className="px-4 py-2 text-gray-900">
                          {product.title}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-600">
                          {product.unitsSold}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-900">
                          {formatPrice(product.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
