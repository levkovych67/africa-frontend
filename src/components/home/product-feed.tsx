"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/product/product-card";
import { ProductGrid, ProductGridItem } from "@/components/product/product-grid";
import { ProductOverlay } from "@/components/product/product-overlay";

export function ProductFeed() {
  const { data, isLoading, error } = useProducts({ size: 20, sort: "createdAt,desc" });
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 px-6 md:px-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden shadow-soft"
          >
            <div className="aspect-square bg-stone-100 animate-pulse mb-4" />
            <div className="flex justify-between">
              <div className="h-4 w-1/2 bg-stone-100 animate-pulse" />
              <div className="h-4 w-1/4 bg-stone-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center text-sm text-stone-500">
        Помилка завантаження товарів
      </div>
    );
  }

  const products = data?.content.filter((p) => p.status === "ACTIVE") ?? [];

  if (products.length === 0) {
    return (
      <div className="py-20 text-center text-sm text-stone-500">
        Товари незабаром з&apos;являться
      </div>
    );
  }

  return (
    <>
      <ProductGrid>
        {products.map((product, i) => (
          <ProductGridItem key={product.id}>
            <ProductCard
              product={product}
              priority={false}
              onExpand={setExpandedSlug}
            />
          </ProductGridItem>
        ))}
      </ProductGrid>

      {expandedSlug && (
        <ProductOverlay
          slug={expandedSlug}
          onClose={() => setExpandedSlug(null)}
        />
      )}
    </>
  );
}
