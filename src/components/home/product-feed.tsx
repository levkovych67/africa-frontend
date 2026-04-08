"use client";

import { useState, useMemo, useCallback, useTransition, lazy, Suspense } from "react";
import { createPortal } from "react-dom";
import { useInfiniteProducts } from "@/hooks/use-products";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { ProductCard } from "@/components/product/product-card";
import { ProductGrid, ProductGridItem } from "@/components/product/product-grid";
import { ProductFilters, ActiveFilters } from "@/components/product/product-filters";
import { LoadMoreSkeleton } from "@/components/product/load-more-skeleton";

const ProductOverlay = lazy(() => import("@/components/product/product-overlay").then(m => ({ default: m.ProductOverlay })));
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
      const attr = (product.attributes ?? []).find((a) => a.type === type);
      if (!attr) return false;
      return selectedValues.some((v) => (attr.values ?? []).includes(v));
    })
  );
}

export function ProductFeed() {
  const [filters, setFilters] = useState<ActiveFilters>({
    artistId: null,
    attributes: {},
  });
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts({
    size: 12,
    sort: "createdAt,desc",
    artistId: filters.artistId ?? undefined,
  });

  const allProducts = useMemo(
    () => data?.pages.flatMap((page) => page.content) ?? [],
    [data]
  );

  const products = useMemo(() => {
    const active = allProducts.filter((p) => p.status === "ACTIVE");
    return filterByAttributes(active, filters.attributes);
  }, [allProducts, filters.attributes]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sentinelRef = useIntersectionObserver(
    handleLoadMore,
    !!hasNextPage && !isFetchingNextPage
  );

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
      ) : products.length === 0 && !hasNextPage ? (
        <div className="py-20 text-center text-sm text-stone-500">
          {allProducts.length > 0
            ? "Немає товарів за обраними фільтрами"
            : "Товари незабаром з\u0027являться"}
        </div>
      ) : (
        <>
          <ProductGrid>
            {products.map((product) => (
              <ProductGridItem key={product.id}>
                <ProductCard
                  product={product}
                  priority={false}
                  onExpand={(slug) => startTransition(() => setExpandedSlug(slug))}
                />
              </ProductGridItem>
            ))}
          </ProductGrid>

          {/* Sentinel for infinite scroll — triggers next page load */}
          <div ref={sentinelRef} className="h-1" />

          {isFetchingNextPage && <LoadMoreSkeleton />}
        </>
      )}

      {expandedSlug && createPortal(
        <Suspense fallback={null}>
          <ProductOverlay
            slug={expandedSlug}
            onClose={() => setExpandedSlug(null)}
          />
        </Suspense>,
        document.body
      )}
    </>
  );
}
