import { ApiError } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export class ApiRequestError extends Error {
  status: number;
  details: string;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiRequestError";
    this.status = error.status;
    this.details = error.error;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

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
