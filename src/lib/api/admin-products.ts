import { adminClient } from "./admin-client";
import { PaginatedResponse } from "@/types/api";
import { Product } from "@/types/product";

export async function getAdminProducts(params?: {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  status?: string;
}): Promise<PaginatedResponse<Product>> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.set("page", String(params.page));
  if (params?.size !== undefined) searchParams.set("size", String(params.size));
  if (params?.sort) searchParams.set("sort", params.sort);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.status) searchParams.set("status", params.status);

  const query = searchParams.toString();
  return adminClient<PaginatedResponse<Product>>(
    `/api/v1/admin/products${query ? `?${query}` : ""}`
  );
}

export async function getAdminProduct(id: string): Promise<Product> {
  return adminClient<Product>(`/api/v1/admin/products/${id}`);
}

export interface CreateProductPayload {
  title: string;
  slug?: string;
  description?: string;
  artistId?: string;
  attributes?: { type: string; values: string[] }[];
  variants?: {
    sku: string;
    attributes: Record<string, string>;
    price: number;
    stock: number;
  }[];
  images?: string[];
  status?: "DRAFT" | "ACTIVE";
}

export async function createProduct(data: CreateProductPayload): Promise<Product> {
  return adminClient<Product>("/api/v1/admin/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProduct(
  id: string,
  data: Partial<CreateProductPayload>
): Promise<Product> {
  return adminClient<Product>(`/api/v1/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function archiveProduct(id: string): Promise<void> {
  return adminClient<void>(`/api/v1/admin/products/${id}`, {
    method: "DELETE",
  });
}
