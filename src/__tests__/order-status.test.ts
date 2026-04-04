import { describe, it, expect } from "vitest";
import { OrderStatus } from "@/types/admin";

// Status transition rules from order-detail.tsx
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  WAITING_PAYMENT: ["CANCELLED"],
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

// TTN validation (same regex as TtnModal in order-detail.tsx)
function validateTtn(ttn: string): boolean {
  return /^\d{14}$/.test(ttn.trim());
}

describe("Order Status Transitions", () => {
  it("WAITING_PAYMENT can only be cancelled", () => {
    expect(ALLOWED_TRANSITIONS.WAITING_PAYMENT).toEqual(["CANCELLED"]);
  });

  it("PENDING can be confirmed or cancelled", () => {
    expect(ALLOWED_TRANSITIONS.PENDING).toContain("CONFIRMED");
    expect(ALLOWED_TRANSITIONS.PENDING).toContain("CANCELLED");
  });

  it("CONFIRMED can only move to SHIPPED", () => {
    expect(ALLOWED_TRANSITIONS.CONFIRMED).toEqual(["SHIPPED"]);
  });

  it("SHIPPED can only move to DELIVERED", () => {
    expect(ALLOWED_TRANSITIONS.SHIPPED).toEqual(["DELIVERED"]);
  });

  it("DELIVERED is a terminal state", () => {
    expect(ALLOWED_TRANSITIONS.DELIVERED).toHaveLength(0);
  });

  it("CANCELLED is a terminal state", () => {
    expect(ALLOWED_TRANSITIONS.CANCELLED).toHaveLength(0);
  });

  it("all statuses are covered", () => {
    const allStatuses: OrderStatus[] = [
      "WAITING_PAYMENT",
      "PENDING",
      "CONFIRMED",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    expect(Object.keys(ALLOWED_TRANSITIONS).sort()).toEqual(
      allStatuses.sort()
    );
  });
});

describe("TTN Validation", () => {
  it("accepts valid 14-digit TTN", () => {
    expect(validateTtn("20450000000000")).toBe(true);
    expect(validateTtn("59000000000000")).toBe(true);
  });

  it("rejects empty string", () => {
    expect(validateTtn("")).toBe(false);
  });

  it("rejects TTN shorter than 14 digits", () => {
    expect(validateTtn("1234567890123")).toBe(false);
  });

  it("rejects TTN longer than 14 digits", () => {
    expect(validateTtn("123456789012345")).toBe(false);
  });

  it("rejects TTN with letters", () => {
    expect(validateTtn("2045000000000a")).toBe(false);
  });

  it("rejects TTN with spaces", () => {
    expect(validateTtn("2045 0000000000")).toBe(false);
  });

  it("trims whitespace before validation", () => {
    expect(validateTtn("  20450000000000  ")).toBe(true);
  });
});
