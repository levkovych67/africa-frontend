"use client";

import { useArtist, useArtistProducts } from "@/hooks/use-artists";
import { ProductCard } from "@/components/product/product-card";
import {
  ProductGrid,
  ProductGridItem,
} from "@/components/product/product-grid";

interface ArtistDetailProps {
  slug: string;
}

export function ArtistDetail({ slug }: ArtistDetailProps) {
  const { data: artist, isLoading: artistLoading, error: artistError } = useArtist(slug);
  const { data: productsData, isLoading: productsLoading } = useArtistProducts(slug, { size: 40 });

  if (artistLoading) {
    return (
      <div className="px-6 py-12">
        <div className="h-10 w-1/3 bg-stone-100 animate-pulse mb-4 rounded-xl" />
        <div className="h-5 w-2/3 bg-stone-100 animate-pulse mb-12 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white shadow-soft overflow-hidden p-4">
              <div className="aspect-square bg-stone-100 animate-pulse mb-4 rounded-xl" />
              <div className="h-4 w-1/2 bg-stone-100 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (artistError || !artist) {
    return (
      <div className="py-20 text-center text-sm text-stone-500">
        Артиста не знайдено
      </div>
    );
  }

  const products = productsData?.content.filter((p) => p.status === "ACTIVE") ?? [];

  return (
    <div>
      <div className="px-6 py-12 border-b border-stone-200/50">
        <h1 className="text-h1-hero font-jakarta font-bold">{artist.name}</h1>
        {artist.bio && (
          <p className="font-jakarta text-sm text-stone-500 mt-2 max-w-2xl">
            {artist.bio}
          </p>
        )}
        {artist.socialLinks && Object.keys(artist.socialLinks).length > 0 && (
          <div className="flex gap-4 mt-4">
            {Object.entries(artist.socialLinks).map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-jakarta text-xs uppercase tracking-wide text-stone-500 hover:text-stone-900"
              >
                {platform}
              </a>
            ))}
          </div>
        )}
      </div>

      {productsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 px-6 md:px-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white shadow-soft overflow-hidden p-4">
              <div className="aspect-square bg-stone-100 animate-pulse mb-4 rounded-xl" />
              <div className="h-4 w-1/2 bg-stone-100 animate-pulse" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center text-sm text-stone-500">
          Товари незабаром з&apos;являться
        </div>
      ) : (
        <ProductGrid>
          {products.map((product, i) => (
            <ProductGridItem key={product.id}>
              <ProductCard product={product} priority={i < 4} />
            </ProductGridItem>
          ))}
        </ProductGrid>
      )}
    </div>
  );
}
