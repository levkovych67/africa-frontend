import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient, ApiRequestError } from "@/lib/api/client";

describe("apiClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("makes GET request and returns JSON", async () => {
    const mockData = { id: "1", title: "Test" };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      })
    );

    const result = await apiClient("/api/v1/products");
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/products"),
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("throws ApiRequestError on non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: () =>
          Promise.resolve({
            status: 404,
            error: "Not Found",
            message: "Product not found",
            timestamp: "2026-01-01T00:00:00Z",
          }),
      })
    );

    await expect(apiClient("/api/v1/products/missing")).rejects.toThrow(
      ApiRequestError
    );

    try {
      await apiClient("/api/v1/products/missing");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiRequestError);
      expect((err as ApiRequestError).status).toBe(404);
      expect((err as ApiRequestError).message).toBe("Product not found");
    }
  });

  it("handles 204 No Content", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
      })
    );

    const result = await apiClient("/api/v1/admin/products/123");
    expect(result).toBeUndefined();
  });

  it("handles JSON parse error on error response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: () => Promise.reject(new Error("invalid json")),
      })
    );

    await expect(apiClient("/api/v1/broken")).rejects.toThrow(ApiRequestError);

    try {
      await apiClient("/api/v1/broken");
    } catch (err) {
      expect((err as ApiRequestError).status).toBe(500);
      expect((err as ApiRequestError).message).toBe(
        "Сталася неочікувана помилка"
      );
    }
  });

  it("passes custom headers and options", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ ok: true }),
      })
    );

    await apiClient("/api/v1/orders/checkout", {
      method: "POST",
      body: JSON.stringify({ test: true }),
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ test: true }),
      })
    );
  });
});
