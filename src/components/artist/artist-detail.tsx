"use client";

import { useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useArtist, useInfiniteArtistProducts } from "@/hooks/use-artists";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { ProductCard } from "@/components/product/product-card";
import {
  ProductGrid,
  ProductGridItem,
} from "@/components/product/product-grid";
import { LoadMoreSkeleton } from "@/components/product/load-more-skeleton";

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  twitter: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  facebook: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  youtube: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  ),
  tiktok: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.57 6.33 6.33 0 0 0 9.37 22a6.33 6.33 0 0 0 6.37-6.23V9.34a8.16 8.16 0 0 0 3.85.97V6.69" />
    </svg>
  ),
  spotify: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  ),
};

interface ArtistDetailProps {
  slug: string;
}

export function ArtistDetail({ slug }: ArtistDetailProps) {
  const { data: artist, isLoading: artistLoading, error: artistError } = useArtist(slug);
  const {
    data: productsData,
    isLoading: productsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteArtistProducts(slug, { size: 12 });

  const products = useMemo(
    () => productsData?.pages.flatMap((p) => p.content).filter((p) => p.status === "ACTIVE") ?? [],
    [productsData]
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sentinelRef = useIntersectionObserver(handleLoadMore, !!hasNextPage && !isFetchingNextPage);

  if (artistLoading) {
    return (
      <div className="px-6 md:px-8 py-12">
        <div className="h-10 w-1/3 bg-stone-100 animate-pulse mb-4 rounded-full" />
        <div className="h-5 w-2/3 bg-stone-100 animate-pulse mb-12 rounded-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden shadow-soft">
              <div className="aspect-square bg-stone-100 animate-pulse" />
              <div className="p-4">
                <div className="h-4 w-1/2 bg-stone-100 animate-pulse rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (artistError || !artist) {
    return (
      <div className="py-20 text-center">
        <p className="font-grotesk text-5xl text-stone-200 font-bold mb-4">?</p>
        <p className="text-sm text-stone-500">Артиста не знайдено</p>
      </div>
    );
  }

  const hasSocials = artist.socialLinks && Object.keys(artist.socialLinks).length > 0;

  return (
    <div>
      {/* Artist header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="px-6 md:px-8 py-12 border-b border-stone-200/50"
      >
        <div className="flex items-start gap-6">
          {/* Artist image */}
          {artist.image && (
            <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-stone-100 shrink-0">
              <Image
                src={artist.image}
                alt={artist.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 80px, 112px"
              />
            </div>
          )}

          <div className="min-w-0">
            <h1 className="text-h2-section font-jakarta font-bold">{artist.name}</h1>

            {artist.bio && (
              <p className="text-sm text-stone-500 mt-2 max-w-2xl leading-relaxed">
                {artist.bio}
              </p>
            )}

            {/* Social links with icons */}
            {hasSocials && (
              <div className="flex gap-2 mt-4">
                {Object.entries(artist.socialLinks).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-900 hover:text-white transition-all duration-200"
                    title={platform}
                  >
                    {SOCIAL_ICONS[platform.toLowerCase()] || (
                      <span className="text-[10px] font-jakarta font-bold uppercase">
                        {platform.slice(0, 2)}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Products section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 30 }}
        className="py-8"
      >
        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 px-6 md:px-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden shadow-soft">
                <div className="aspect-square bg-stone-100 animate-pulse" />
                <div className="p-4">
                  <div className="h-4 w-1/2 bg-stone-100 animate-pulse rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-stone-400">
              Товари незабаром з&apos;являться
            </p>
          </div>
        ) : (
          <>
            <ProductGrid>
              {products.map((product, i) => (
                <ProductGridItem key={product.id}>
                  <ProductCard product={product} priority={i < 4} />
                </ProductGridItem>
              ))}
            </ProductGrid>
            <div ref={sentinelRef} className="h-1" />
            {isFetchingNextPage && <LoadMoreSkeleton />}
          </>
        )}
      </motion.div>
    </div>
  );
}
