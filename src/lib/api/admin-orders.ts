import { adminClient } from "./admin-client";
import { PaginatedResponse } from "@/types/api";
import { AdminOrder, OrderStatus } from "@/types/admin";

export async function getAdminOrders(params?: {
  search?: string;
  status?: OrderStatus;
  page?: number;
  size?: number;
  sort?: string;
}): Promise<PaginatedResponse<AdminOrder>> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.page !== undefined) searchParams.set("page", String(params.page));
  if (params?.size !== undefined) searchParams.set("size", String(params.size));
  if (params?.sort) searchParams.set("sort", params.sort);

  const query = searchParams.toString();
  return adminClient<PaginatedResponse<AdminOrder>>(
    `/api/v1/admin/orders${query ? `?${query}` : ""}`
  );
}

export async function getAdminOrder(id: string): Promise<AdminOrder> {
  return adminClient<AdminOrder>(`/api/v1/admin/orders/${id}`);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  trackingNumber?: string
): Promise<AdminOrder> {
  return adminClient<AdminOrder>(`/api/v1/admin/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status, trackingNumber: trackingNumber || undefined }),
  });
}

export async function deleteOrder(id: string): Promise<void> {
  return adminClient<void>(`/api/v1/admin/orders/${id}`, {
    method: "DELETE",
  });
}
