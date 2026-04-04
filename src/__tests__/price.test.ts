import { describe, it, expect } from "vitest";
import { formatPrice } from "@/lib/utils/price";

describe("formatPrice", () => {
  it("formats whole numbers with 2 decimal places", () => {
    expect(formatPrice(100)).toBe("100.00 UAH");
  });

  it("formats decimal prices", () => {
    expect(formatPrice(29.99)).toBe("29.99 UAH");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toBe("0.00 UAH");
  });

  it("rounds to 2 decimal places", () => {
    expect(formatPrice(9.999)).toBe("10.00 UAH");
  });

  it("handles large numbers", () => {
    expect(formatPrice(12500)).toBe("12500.00 UAH");
  });
});
