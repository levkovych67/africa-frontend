import { CheckoutPayload, OrderResponse } from "@/types/order";
import { apiClient } from "./client";

export async function submitCheckout(
  payload: CheckoutPayload
): Promise<OrderResponse> {
  return apiClient<OrderResponse>("/api/v1/orders/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
