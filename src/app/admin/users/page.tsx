"use client";

import { useState, useMemo } from "react";
import {
  useAdminUsers,
  useCreateAdminUser,
  useDeleteAdminUser,
} from "@/hooks/use-admin-users";
import { useAuthStore } from "@/store/auth";

function getCurrentEmailFromJwt(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.email || null;
  } catch {
    return null;
  }
}

export default function AdminUsersPage() {
  const { data: users, isLoading, error } = useAdminUsers();
  const createMutation = useCreateAdminUser();
  const deleteMutation = useDeleteAdminUser();
  const accessToken = useAuthStore((s) => s.accessToken);
  const currentEmail = useMemo(() => getCurrentEmailFromJwt(accessToken), [accessToken]);

  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { email, password, name },
      {
        onSuccess: () => {
          setEmail("");
          setPassword("");
          setName("");
          setShowForm(false);
        },
      }
    );
  };

  const handleDelete = (id: string, userName: string) => {
    if (confirm(`Видалити адміна "${userName}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("uk-UA");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Адміністратори</h1>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700"
        >
          {showForm ? "Скасувати" : "Додати адміна"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-lg p-6 mb-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ім&apos;я
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {createMutation.error && (
            <p className="text-red-600 text-sm">
              {createMutation.error.message}
            </p>
          )}

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? "Створення..." : "Створити"}
          </button>
        </form>
      )}

      {isLoading && <p className="text-gray-500 text-sm">Завантаження...</p>}
      {error && (
        <p className="text-red-600 text-sm">
          Помилка завантаження адміністраторів
        </p>
      )}

      {users && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Ім&apos;я
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Email
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">
                  Дата
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">
                  Дії
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100"
                >
                  <td className="px-4 py-3 text-gray-900">{user.name}</td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {currentEmail === user.email ? (
                      <span className="text-xs text-gray-400">Ви</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDelete(user.id, user.name)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                      >
                        Видалити
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Адміністраторів не знайдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
