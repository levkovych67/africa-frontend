import { NovaCity, NovaWarehouse } from "@/types/order";
import { apiClient } from "./client";

export async function searchCities(query: string): Promise<NovaCity[]> {
  return apiClient<NovaCity[]>(
    `/api/v1/orders/nova-poshta/cities?q=${encodeURIComponent(query)}&limit=10`
  );
}

export async function getWarehouses(cityRef: string): Promise<NovaWarehouse[]> {
  return apiClient<NovaWarehouse[]>(
    `/api/v1/orders/nova-poshta/warehouses?cityRef=${encodeURIComponent(cityRef)}`
  );
}
