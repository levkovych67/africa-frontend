"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/store/cart";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface ProductVariantEvent {
  sku: string;
  stock: number;
  price: number;
  attributes: Record<string, string>;
}

interface ProductUpdateEvent {
  eventType: string;
  productId: string;
  slug: string | null;
  variants: ProductVariantEvent[] | null;
}

export function useProductEvents() {
  const queryClient = useQueryClient();
  const syncStock = useCartStore((s) => s.syncStock);

  useEffect(() => {
    const es = new EventSource(`${BASE_URL}/api/v1/products/events`);

    es.addEventListener("product-update", (e) => {
      try {
        const event: ProductUpdateEvent = JSON.parse(e.data);

        // Invalidate React Query caches
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["products-infinite"] });
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        if (event.slug) {
          queryClient.invalidateQueries({ queryKey: ["product", event.slug] });
        }
        if (event.productId) {
          queryClient.invalidateQueries({
            queryKey: ["admin-product", event.productId],
          });
        }

        // Sync cart stock limits
        if (event.variants) {
          for (const v of event.variants) {
            syncStock(v.sku, v.stock);
          }
        }
      } catch {
        // ignore malformed events
      }
    });

    return () => es.close();
  }, [queryClient, syncStock]);
}
