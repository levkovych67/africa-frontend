"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/api/admin-dashboard";

export function useDashboardStats(from: string, to: string) {
  return useQuery({
    queryKey: ["dashboard-stats", from, to],
    queryFn: () => getDashboardStats(from, to),
    enabled: !!from && !!to,
  });
}
