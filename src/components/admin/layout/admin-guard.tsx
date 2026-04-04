"use client";

import { useSyncExternalStore, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";

function useStoreHydrated() {
  return useSyncExternalStore(
    (cb) => useAuthStore.persist.onFinishHydration(cb),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((s) => s.accessToken);
  const hydrated = useStoreHydrated();

  useEffect(() => {
    if (hydrated && !accessToken && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [hydrated, accessToken, pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Завантаження...</p>
      </div>
    );
  }

  if (!accessToken) {
    return null;
  }

  return <>{children}</>;
}
