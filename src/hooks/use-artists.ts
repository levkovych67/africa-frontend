"use client";

import { useQuery } from "@tanstack/react-query";
import { getArtists, getArtist, getArtistProducts } from "@/lib/api/artists";

export function useArtists() {
  return useQuery({
    queryKey: ["artists"],
    queryFn: () => getArtists(),
  });
}

export function useArtist(slug: string) {
  return useQuery({
    queryKey: ["artist", slug],
    queryFn: () => getArtist(slug),
    enabled: !!slug,
  });
}

export function useArtistProducts(
  slug: string,
  params?: { page?: number; size?: number }
) {
  return useQuery({
    queryKey: ["artist-products", slug, params],
    queryFn: () => getArtistProducts(slug, params),
    enabled: !!slug,
  });
}
