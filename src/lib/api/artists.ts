import { PaginatedResponse } from "@/types/api";
import { Artist } from "@/types/artist";
import { Product } from "@/types/product";
import { apiClient } from "./client";

export async function getArtists(): Promise<Artist[]> {
  return apiClient<Artist[]>("/api/v1/artists");
}

export async function getArtist(slug: string): Promise<Artist> {
  return apiClient<Artist>(`/api/v1/artists/${slug}`);
}

export async function getArtistProducts(
  slug: string,
  params?: { page?: number; size?: number }
): Promise<PaginatedResponse<Product>> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.set("page", String(params.page));
  if (params?.size !== undefined) searchParams.set("size", String(params.size));

  const query = searchParams.toString();
  return apiClient<PaginatedResponse<Product>>(
    `/api/v1/artists/${slug}/products${query ? `?${query}` : ""}`
  );
}
