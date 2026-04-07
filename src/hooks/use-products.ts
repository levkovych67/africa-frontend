"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getProducts, getProductBySlug } from "@/lib/api/products";

export function useProducts(params?: {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
  artistId?: string;
}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
  });
}

export function useInfiniteProducts(params?: {
  size?: number;
  search?: string;
  sort?: string;
  artistId?: string;
}) {
  const size = params?.size ?? 12;

  return useInfiniteQuery({
    queryKey: ["products-infinite", params],
    queryFn: ({ pageParam }) =>
      getProducts({ ...params, page: pageParam, size }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
  });
}
