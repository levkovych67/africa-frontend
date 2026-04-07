"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
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

export function useInfiniteArtistProducts(
  slug: string,
  params?: { size?: number }
) {
  const size = params?.size ?? 12;

  return useInfiniteQuery({
    queryKey: ["artist-products-infinite", slug, params],
    queryFn: ({ pageParam }) =>
      getArtistProducts(slug, { page: pageParam, size }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
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
