import { apiClient } from "./client";
import { adminClient } from "./admin-client";
import { AuthTokens, LoginPayload } from "@/types/admin";

export async function login(payload: LoginPayload): Promise<AuthTokens> {
  return apiClient<AuthTokens>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<AuthTokens> {
  return apiClient<AuthTokens>("/api/v1/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export async function logoutApi(): Promise<void> {
  return adminClient<void>("/api/v1/auth/logout", {
    method: "POST",
  });
}
