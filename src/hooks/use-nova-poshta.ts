"use client";

import { useQuery } from "@tanstack/react-query";
import { searchCities, getWarehouses } from "@/lib/api/nova-poshta";

export function useCitySearch(query: string) {
  return useQuery({
    queryKey: ["nova-poshta-cities", query],
    queryFn: () => searchCities(query),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
}

export function useWarehouses(cityRef: string | null) {
  return useQuery({
    queryKey: ["nova-poshta-warehouses", cityRef],
    queryFn: () => getWarehouses(cityRef!),
    enabled: !!cityRef,
    staleTime: 5 * 60 * 1000,
  });
}
