import { PaginatedResponse } from "@/types/api";
import { Product, ProductFilters } from "@/types/product";
import { apiClient } from "./client";

export async function getProducts(params?: {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
  artistId?: string;
}): Promise<PaginatedResponse<Product>> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.set("page", String(params.page));
  if (params?.size !== undefined) searchParams.set("size", String(params.size));
  if (params?.search) searchParams.set("search", params.search);
  if (params?.sort) searchParams.set("sort", params.sort);
  if (params?.artistId) searchParams.set("artistId", params.artistId);

  const query = searchParams.toString();
  return apiClient<PaginatedResponse<Product>>(
    `/api/v1/products${query ? `?${query}` : ""}`
  );
}

export async function getProductBySlug(slug: string): Promise<Product> {
  return apiClient<Product>(`/api/v1/products/${slug}`);
}

export async function getProductFilters(): Promise<ProductFilters> {
  return apiClient<ProductFilters>("/api/v1/products/filters");
}
