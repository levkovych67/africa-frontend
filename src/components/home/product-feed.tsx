"use client";

import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/product/product-card";
import { ProductGrid, ProductGridItem } from "@/components/product/product-grid";

export function ProductFeed() {
  const { data, isLoading, error } = useProducts({ size: 20 });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="border-b border-r border-black p-4"
          >
            <div className="aspect-square bg-surface-muted animate-pulse mb-4" />
            <div className="flex justify-between">
              <div className="h-4 w-1/2 bg-surface-muted animate-pulse" />
              <div className="h-4 w-1/4 bg-surface-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center font-mono text-sm">
        Помилка завантаження товарів
      </div>
    );
  }

  const products = data?.content.filter((p) => p.status === "ACTIVE") ?? [];

  if (products.length === 0) {
    return (
      <div className="py-20 text-center font-mono text-sm">
        Товари незабаром з&apos;являться
      </div>
    );
  }

  return (
    <ProductGrid>
      {products.map((product, i) => (
        <ProductGridItem key={product.id}>
          <ProductCard product={product} priority={i < 4} />
        </ProductGridItem>
      ))}
    </ProductGrid>
  );
}
