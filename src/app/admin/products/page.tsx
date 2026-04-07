"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminProducts } from "@/hooks/use-admin-products";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatPrice } from "@/lib/utils/price";

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  DRAFT: "bg-gray-100 text-gray-800",
  ARCHIVED: "bg-red-100 text-red-800",
};

const STATUS_OPTIONS = [
  { value: "", label: "Всі статуси" },
  { value: "ACTIVE", label: "Активні" },
  { value: "DRAFT", label: "Чернетки" },
  { value: "ARCHIVED", label: "Архівовані" },
];

export default function AdminProductsPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, error } = useAdminProducts({
    page,
    size: 20,
    sort: "createdAt,desc",
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("uk-UA");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Товари</h1>
        <Link
          href="/admin/products/new"
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700"
        >
          Додати товар
        </Link>
      </div>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Пошук за назвою..."
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
            setStatusFilter(e.target.value);
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
        <p className="text-red-600 text-sm">Помилка завантаження товарів</p>
      )}

      {data && (
        <>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Назва
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Артист
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Ціна
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Статус
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Варіантів
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Дата
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((product) => (
                  <tr
                    key={product.id}
                    onClick={() =>
                      router.push(`/admin/products/${product.id}`)
                    }
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-3 text-gray-900">
                      {product.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {product.artistName || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {formatPrice(product.minPrice)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${STATUS_BADGE[product.status] || ""}`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {product.variants.length}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(product.createdAt)}
                    </td>
                  </tr>
                ))}
                {data.content.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Товарів не знайдено
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
