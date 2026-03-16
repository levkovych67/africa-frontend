"use client";

import { useQuery } from "@tanstack/react-query";
import { getProducts, getProductBySlug } from "@/lib/api/products";

export function useProducts(params?: {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
  });
}
