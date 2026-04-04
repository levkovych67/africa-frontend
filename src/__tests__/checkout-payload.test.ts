import { describe, it, expect } from "vitest";
import { CheckoutPayload, PaymentMethod } from "@/types/order";

describe("CheckoutPayload types", () => {
  it("builds valid COD checkout payload", () => {
    const payload: CheckoutPayload = {
      firstName: "Олександр",
      lastName: "Петренко",
      email: "alex@example.com",
      phone: "+380991234567",
      items: [
        { productId: "prod-1", sku: "TSHIRT-BLK-S", quantity: 2 },
      ],
      shippingDetails: {
        city: "Київ",
        cityRef: "city-ref-123",
        warehouseRef: "wh-ref-456",
        warehouseDescription: "Відділення №1: вул. Хрещатик, 1",
      },
      paymentMethod: "COD",
    };

    expect(payload.paymentMethod).toBe("COD");
    expect(payload.items).toHaveLength(1);
    expect(payload.items[0].quantity).toBe(2);
  });

  it("builds valid ONLINE checkout payload", () => {
    const payload: CheckoutPayload = {
      firstName: "Марія",
      lastName: "Коваленко",
      email: "maria@example.com",
      phone: "+380501234567",
      items: [
        { productId: "prod-1", sku: "HOODIE-WHT-M", quantity: 1 },
        { productId: "prod-2", sku: "CAP-BLK", quantity: 3 },
      ],
      shippingDetails: {
        city: "Львів",
        cityRef: "city-ref-789",
        warehouseRef: "wh-ref-012",
        warehouseDescription: "Поштомат №25",
      },
      paymentMethod: "ONLINE",
      comment: "Подзвоніть перед доставкою",
    };

    expect(payload.paymentMethod).toBe("ONLINE");
    expect(payload.comment).toBe("Подзвоніть перед доставкою");
    expect(payload.items).toHaveLength(2);
  });

  it("PaymentMethod is one of COD or ONLINE", () => {
    const validMethods: PaymentMethod[] = ["COD", "ONLINE"];
    expect(validMethods).toContain("COD");
    expect(validMethods).toContain("ONLINE");
    expect(validMethods).toHaveLength(2);
  });
});
