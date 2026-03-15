"use client";

import { useMutation } from "@tanstack/react-query";
import { submitCheckout } from "@/lib/api/orders";
import { CheckoutPayload } from "@/types/order";

export function useCheckout() {
  return useMutation({
    mutationFn: (payload: CheckoutPayload) => submitCheckout(payload),
  });
}
