"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminOrders,
  getAdminOrder,
  updateOrderStatus,
} from "@/lib/api/admin-orders";
import { OrderStatus } from "@/types/admin";

export function useAdminOrders(params?: {
  search?: string;
  status?: OrderStatus;
  page?: number;
  size?: number;
  sort?: string;
}) {
  return useQuery({
    queryKey: ["admin-orders", params],
    queryFn: () => getAdminOrders(params),
  });
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: ["admin-orders", id],
    queryFn: () => getAdminOrder(id),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      trackingNumber,
    }: {
      id: string;
      status: OrderStatus;
      trackingNumber?: string;
    }) => updateOrderStatus(id, status, trackingNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
}
