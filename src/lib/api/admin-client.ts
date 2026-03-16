import { ApiError } from "@/types/api";
import { ApiRequestError } from "./client";
import { useAuthStore } from "@/store/auth";
import { refreshAccessToken } from "./admin-auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

let isRefreshing = false;

export async function adminClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const { accessToken } = useAuthStore.getState();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options?.headers,
    },
  });

  if (response.status === 401 && !isRefreshing) {
    const { refreshToken } = useAuthStore.getState();

    if (refreshToken) {
      isRefreshing = true;
      try {
        const tokens = await refreshAccessToken(refreshToken);
        useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken);
        isRefreshing = false;
        return adminClient<T>(endpoint, options);
      } catch {
        isRefreshing = false;
        useAuthStore.getState().clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/admin/login";
        }
        throw new Error("Сесія закінчилась");
      }
    }

    useAuthStore.getState().clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
    throw new Error("Не авторизовано");
  }

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      status: response.status,
      error: response.statusText,
      message: "Сталася неочікувана помилка",
      timestamp: new Date().toISOString(),
    }));
    throw new ApiRequestError(error);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
