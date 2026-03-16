"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsubFinishHydration = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return unsubFinishHydration;
  }, []);

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
