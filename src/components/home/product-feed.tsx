"use client";

import { useState, useMemo } from "react";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/product/product-card";
import { ProductGrid, ProductGridItem } from "@/components/product/product-grid";
import { ProductOverlay } from "@/components/product/product-overlay";
import { ProductFilters, ActiveFilters } from "@/components/product/product-filters";
import { Product } from "@/types/product";

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

export function ProductFeed() {
  const [filters, setFilters] = useState<ActiveFilters>({
    artistId: null,
    attributes: {},
  });
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const { data, isLoading, error } = useProducts({
    size: 100,
    sort: "createdAt,desc",
    artistId: filters.artistId ?? undefined,
  });

  const products = useMemo(() => {
    const active = data?.content.filter((p) => p.status === "ACTIVE") ?? [];
    return filterByAttributes(active, filters.attributes);
  }, [data, filters.attributes]);

  return (
    <>
      <ProductFilters filters={filters} onChange={setFilters} />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 px-6 md:px-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden shadow-soft">
              <div className="aspect-square bg-stone-100 animate-pulse mb-4" />
              <div className="flex justify-between">
                <div className="h-4 w-1/2 bg-stone-100 animate-pulse" />
                <div className="h-4 w-1/4 bg-stone-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="py-20 text-center text-sm text-stone-500">
          Помилка завантаження товарів
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center text-sm text-stone-500">
          {data?.content.length
            ? "Немає товарів за обраними фільтрами"
            : "Товари незабаром з\u0027являться"}
        </div>
      ) : (
        <ProductGrid>
          {products.map((product) => (
            <ProductGridItem key={product.id}>
              <ProductCard
                product={product}
                priority={false}
                onExpand={setExpandedSlug}
              />
            </ProductGridItem>
          ))}
        </ProductGrid>
      )}

      {expandedSlug && (
        <ProductOverlay
          slug={expandedSlug}
          onClose={() => setExpandedSlug(null)}
        />
      )}
    </>
  );
}
