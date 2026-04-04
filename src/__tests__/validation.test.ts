import { describe, it, expect } from "vitest";
import { validateCheckout } from "@/lib/utils/validation";

const validData = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "+380991234567",
  cityRef: "abc123",
  warehouseRef: "wh456",
};

describe("validateCheckout", () => {
  it("returns no errors for valid data", () => {
    expect(validateCheckout(validData)).toEqual({});
  });

  it("requires firstName", () => {
    const errors = validateCheckout({ ...validData, firstName: "" });
    expect(errors.firstName).toBeDefined();
  });

  it("requires lastName", () => {
    const errors = validateCheckout({ ...validData, lastName: "  " });
    expect(errors.lastName).toBeDefined();
  });

  it("requires email", () => {
    const errors = validateCheckout({ ...validData, email: "" });
    expect(errors.email).toBeDefined();
  });

  it("validates email format", () => {
    const errors = validateCheckout({ ...validData, email: "not-an-email" });
    expect(errors.email).toContain("формат");
  });

  it("accepts valid email formats", () => {
    expect(validateCheckout({ ...validData, email: "a@b.c" })).toEqual({});
    expect(validateCheckout({ ...validData, email: "user+tag@example.com" })).toEqual({});
  });

  it("requires phone", () => {
    const errors = validateCheckout({ ...validData, phone: "" });
    expect(errors.phone).toBeDefined();
  });

  it("validates phone format", () => {
    const errors = validateCheckout({ ...validData, phone: "123" });
    expect(errors.phone).toContain("формат");
  });

  it("accepts valid phone formats", () => {
    expect(validateCheckout({ ...validData, phone: "+380991234567" })).toEqual({});
    expect(validateCheckout({ ...validData, phone: "0991234567" })).toEqual({});
    expect(validateCheckout({ ...validData, phone: "+38 (099) 123-45-67" })).toEqual({});
  });

  it("requires cityRef", () => {
    const errors = validateCheckout({ ...validData, cityRef: "" });
    expect(errors.cityRef).toBeDefined();
  });

  it("requires warehouseRef", () => {
    const errors = validateCheckout({ ...validData, warehouseRef: "" });
    expect(errors.warehouseRef).toBeDefined();
  });

  it("returns multiple errors at once", () => {
    const errors = validateCheckout({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      cityRef: "",
      warehouseRef: "",
    });
    expect(Object.keys(errors)).toHaveLength(6);
  });
});
