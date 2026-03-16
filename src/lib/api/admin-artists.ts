import { adminClient } from "./admin-client";
import { PaginatedResponse } from "@/types/api";
import { Artist } from "@/types/artist";

export async function getAdminArtists(params?: {
  page?: number;
  size?: number;
}): Promise<PaginatedResponse<Artist>> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.set("page", String(params.page));
  if (params?.size !== undefined) searchParams.set("size", String(params.size));

  const query = searchParams.toString();
  return adminClient<PaginatedResponse<Artist>>(
    `/api/v1/admin/artists${query ? `?${query}` : ""}`
  );
}

export async function getAdminArtist(id: string): Promise<Artist> {
  return adminClient<Artist>(`/api/v1/admin/artists/${id}`);
}

export interface CreateArtistPayload {
  name: string;
  bio?: string;
  image?: string;
  socialLinks?: Record<string, string>;
}

export async function createArtist(
  data: CreateArtistPayload
): Promise<Artist> {
  return adminClient<Artist>("/api/v1/admin/artists", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateArtist(
  id: string,
  data: Partial<CreateArtistPayload>
): Promise<Artist> {
  return adminClient<Artist>(`/api/v1/admin/artists/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteArtist(id: string): Promise<void> {
  return adminClient<void>(`/api/v1/admin/artists/${id}`, {
    method: "DELETE",
  });
}
