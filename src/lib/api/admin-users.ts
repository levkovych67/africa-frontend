import { adminClient } from "./admin-client";
import { AdminUser, CreateAdminPayload } from "@/types/admin";

export async function getAdminUsers(): Promise<AdminUser[]> {
  return adminClient<AdminUser[]>("/api/v1/admin/users");
}

export async function createAdminUser(
  data: CreateAdminPayload
): Promise<AdminUser> {
  return adminClient<AdminUser>("/api/v1/admin/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteAdminUser(id: string): Promise<void> {
  return adminClient<void>(`/api/v1/admin/users/${id}`, {
    method: "DELETE",
  });
}
