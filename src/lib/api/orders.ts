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

export async function getOrder(id: string): Promise<OrderResponse> {
  return apiClient<OrderResponse>(`/api/v1/orders/${id}`);
}

export async function createPayment(
  orderId: string
): Promise<{ paymentUrl: string }> {
  return apiClient<{ paymentUrl: string }>(
    `/api/v1/payments/create`,
    {
      method: "POST",
      body: JSON.stringify({ orderId }),
    }
  );
}
