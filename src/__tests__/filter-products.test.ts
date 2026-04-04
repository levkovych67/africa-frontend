import { describe, it, expect } from "vitest";
import { Product } from "@/types/product";

// Extract the filterByAttributes logic for testing
// (same function as in product-feed.tsx)
function filterByAttributes(
  products: Product[],
  attributes: Record<string, string[]>
): Product[] {
  const activeEntries = Object.entries(attributes).filter(
    ([, vals]) => vals.length > 0
  );
  if (activeEntries.length === 0) return products;

  return products.filter((product) =>
    activeEntries.every(([type, selectedValues]) => {
      const attr = product.attributes.find((a) => a.type === type);
      if (!attr) return false;
      return selectedValues.some((v) => attr.values.includes(v));
    })
  );
}

const makeProduct = (
  id: string,
  attrs: { type: string; values: string[] }[]
): Product => ({
  id,
  slug: id,
  title: `Product ${id}`,
  description: "",
  basePrice: 100,
  attributes: attrs,
  variants: [],
  images: [],
  artistId: null,
  artistName: null,
  artistSlug: null,
  status: "ACTIVE",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
});

const products: Product[] = [
  makeProduct("p1", [
    { type: "Size", values: ["S", "M"] },
    { type: "Color", values: ["Black"] },
  ]),
  makeProduct("p2", [
    { type: "Size", values: ["L", "XL"] },
    { type: "Color", values: ["White"] },
  ]),
  makeProduct("p3", [
    { type: "Size", values: ["M", "L"] },
    { type: "Color", values: ["Black", "White"] },
  ]),
  makeProduct("p4", [{ type: "Material", values: ["Cotton"] }]),
];

describe("filterByAttributes", () => {
  it("returns all products when no filters active", () => {
    expect(filterByAttributes(products, {})).toHaveLength(4);
    expect(filterByAttributes(products, { Size: [] })).toHaveLength(4);
  });

  it("filters by single attribute value", () => {
    const result = filterByAttributes(products, { Size: ["S"] });
    expect(result.map((p) => p.id)).toEqual(["p1"]);
  });

  it("filters with OR logic within same attribute", () => {
    const result = filterByAttributes(products, { Size: ["S", "L"] });
    expect(result.map((p) => p.id)).toEqual(["p1", "p2", "p3"]);
  });

  it("filters with AND logic across different attributes", () => {
    const result = filterByAttributes(products, {
      Size: ["M"],
      Color: ["Black"],
    });
    // p1 has Size M + Color Black ✓
    // p3 has Size M + Color Black ✓
    expect(result.map((p) => p.id)).toEqual(["p1", "p3"]);
  });

  it("excludes products missing the filtered attribute", () => {
    const result = filterByAttributes(products, { Size: ["S"] });
    // p4 has no Size attribute — should be excluded
    expect(result.find((p) => p.id === "p4")).toBeUndefined();
  });

  it("handles attribute that no product has", () => {
    const result = filterByAttributes(products, { Weight: ["Heavy"] });
    expect(result).toHaveLength(0);
  });

  it("handles multiple attributes where one is empty", () => {
    const result = filterByAttributes(products, {
      Size: ["L"],
      Color: [],
    });
    // Color is empty — ignored. Only Size: L matters
    expect(result.map((p) => p.id)).toEqual(["p2", "p3"]);
  });
});
