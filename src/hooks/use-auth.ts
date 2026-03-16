"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/admin-auth";
import { useAuthStore } from "@/store/auth";

export function useLogin() {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      router.replace("/admin");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const clearTokens = useAuthStore((s) => s.clearTokens);

  const logout = () => {
    clearTokens();
    router.push("/admin/login");
  };

  return logout;
}
