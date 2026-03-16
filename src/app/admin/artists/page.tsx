"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminArtists } from "@/hooks/use-admin-artists";

export default function AdminArtistsPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);

  const { data, isLoading, error } = useAdminArtists({ page, size: 20 });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("uk-UA");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Артисти</h1>
        <Link
          href="/admin/artists/new"
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700"
        >
          Додати артиста
        </Link>
      </div>

      {isLoading && <p className="text-gray-500 text-sm">Завантаження...</p>}
      {error && (
        <p className="text-red-600 text-sm">Помилка завантаження артистів</p>
      )}

      {data && (
        <>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Ім&apos;я
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Slug
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">
                    Дата
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((artist) => (
                  <tr
                    key={artist.id}
                    onClick={() => router.push(`/admin/artists/${artist.id}`)}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-3 text-gray-900">{artist.name}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                      {artist.slug}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(artist.createdAt)}
                    </td>
                  </tr>
                ))}
                {data.content.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Артистів не знайдено
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
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
                Сторінка {data.number + 1} з {data.totalPages}
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
          )}
        </>
      )}
    </div>
  );
}
