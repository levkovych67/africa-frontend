"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function useProductEvents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const es = new EventSource(`${BASE_URL}/api/v1/products/events`);

    es.addEventListener("product-update", (e) => {
      try {
        const event = JSON.parse(e.data);

        if (event.eventType === "PRODUCT_DELETED") {
          queryClient.invalidateQueries({ queryKey: ["products"] });
          queryClient.invalidateQueries({ queryKey: ["products-infinite"] });
          queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        } else {
          // STOCK_CHANGED or PRODUCT_UPDATED — invalidate all product caches
          queryClient.invalidateQueries({ queryKey: ["products"] });
          queryClient.invalidateQueries({ queryKey: ["products-infinite"] });
          queryClient.invalidateQueries({ queryKey: ["admin-products"] });
          if (event.slug) {
            queryClient.invalidateQueries({
              queryKey: ["product", event.slug],
            });
            queryClient.invalidateQueries({
              queryKey: ["admin-product", event.productId],
            });
          }
        }
      } catch {
        // ignore malformed events
      }
    });

    return () => es.close();
  }, [queryClient]);
}
