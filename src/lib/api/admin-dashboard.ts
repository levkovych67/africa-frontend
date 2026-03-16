import { adminClient } from "./admin-client";
import { DashboardStats } from "@/types/admin";

export async function getDashboardStats(
  from: string,
  to: string
): Promise<DashboardStats> {
  return adminClient<DashboardStats>(
    `/api/v1/admin/dashboard/stats?from=${from}&to=${to}`
  );
}
