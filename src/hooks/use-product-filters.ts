"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductFilters } from "@/lib/api/products";

export function useProductFilters() {
  return useQuery({
    queryKey: ["product-filters"],
    queryFn: getProductFilters,
  });
}
