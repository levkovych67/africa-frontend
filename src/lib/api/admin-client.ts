import { ApiError } from "@/types/api";
import { ApiRequestError } from "./client";
import { useAuthStore } from "@/store/auth";
import { refreshAccessToken } from "./admin-auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

let refreshPromise: Promise<{ accessToken: string; refreshToken: string }> | null = null;

export async function adminClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const { accessToken } = useAuthStore.getState();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken?.trim() && { Authorization: `Bearer ${accessToken}` }),
      ...options?.headers,
    },
  });

  if (response.status === 401) {
    const { refreshToken } = useAuthStore.getState();

    if (refreshToken) {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken(refreshToken)
          .then((tokens) => {
            useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken);
            return tokens;
          })
          .catch((err) => {
            useAuthStore.getState().clearTokens();
            if (typeof window !== "undefined") {
              window.location.href = "/admin/login";
            }
            throw err;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      try {
        await refreshPromise;
        return adminClient<T>(endpoint, options);
      } catch {
        throw new Error("Сесія закінчилась");
      }
    }

    useAuthStore.getState().clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
    throw new Error("Не авторизовано");
  }

  if (response.status === 429) {
    throw new ApiRequestError({
      status: 429,
      error: "Too Many Requests",
      message: "Забагато запитів. Зачекайте хвилину і спробуйте ще раз.",
      timestamp: new Date().toISOString(),
    });
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
