"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { submitCheckout, getOrder } from "@/lib/api/orders";
import { CheckoutPayload } from "@/types/order";

export function useCheckout() {
  return useMutation({
    mutationFn: (payload: CheckoutPayload) => submitCheckout(payload),
  });
}

export function useOrder(id: string, accessToken?: string) {
  return useQuery({
    queryKey: ["order", id, accessToken],
    queryFn: () => getOrder(id, accessToken),
    enabled: !!id,
  });
}
