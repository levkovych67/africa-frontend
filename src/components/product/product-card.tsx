"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils/price";

function isImageUrl(url: string): boolean {
  return !url.endsWith(".mp4") && !url.endsWith(".webm") && !url.endsWith(".mov");
}

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  onExpand?: (slug: string) => void;
}

export function ProductCard({ product, priority = false, onExpand }: ProductCardProps) {
  const images = (product.images ?? []).filter(isImageUrl);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasHovered, setHasHovered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => {
    if (!hasHovered) setHasHovered(true);
  }, [hasHovered]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (images.length <= 1) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const segmentWidth = rect.width / images.length;
      const index = Math.min(
        Math.floor(x / segmentWidth),
        images.length - 1
      );
      setActiveIndex(index);
    },
    [images.length]
  );

  const handleMouseLeave = useCallback(() => {
    setActiveIndex(0);
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const index = Math.round(scrollLeft / clientWidth);
    setActiveIndex(index);
  }, []);

  if (images.length === 0) {
    return (
      <div className="rounded-2xl overflow-hidden shadow-soft">

        <div className="aspect-[4/5] bg-stone-100/50 flex items-center justify-center">
          <span className="font-grotesk text-xs text-stone-400">Немає фото</span>
        </div>
        <div className="bg-white rounded-b-2xl p-4">
          <div className="flex justify-between items-start">
            <h3 className="font-jakarta font-semibold text-base text-stone-900">{product.title}</h3>
            <span className="font-grotesk text-sm text-stone-900">{formatPrice(product.minPrice)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={product.slug ? `/product/${product.slug}` : "#"}
      onClick={(e) => {
        if (onExpand) {
          e.preventDefault();
          onExpand(product.slug);
        }
      }}
      className="group block rounded-2xl overflow-hidden shadow-soft hover:-translate-y-1 hover:shadow-lift transition-all duration-300"
    >
      {/* Desktop: hover zone carousel */}
      <div
        className="relative aspect-[4/5] rounded-t-2xl overflow-hidden hidden md:block"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Always render first image */}
        <Image
          src={images[0]}
          alt={`${product.title} 1`}
          fill
          className={cn("object-cover w-full h-full transition-opacity duration-200 ease-in-out", activeIndex === 0 ? "opacity-100" : "opacity-0")}
          sizes="(max-width: 1024px) 50vw, 25vw"
          priority={priority}
        />

        {/* Load remaining images only after first hover */}
        {hasHovered &&
          images.slice(1).map((img, i) => (
            <Image
              key={i + 1}
              src={img}
              alt={`${product.title} ${i + 2}`}
              fill
              className={cn("object-cover w-full h-full transition-opacity duration-200 ease-in-out", i + 1 === activeIndex ? "opacity-100" : "opacity-0")}
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
          ))}

        {/* Segment indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-3 right-3 flex gap-1 z-10">
            {images.map((_, i) => (
              <div
                key={i}
                className={cn("h-[2px] flex-1 transition-colors duration-0", i === activeIndex ? "bg-white" : "bg-white/50")}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile: snap-scroll carousel — only first 2 images eager, rest lazy */}
      <div className="relative aspect-[4/5] rounded-t-2xl overflow-hidden md:hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="snap-carousel"
        >
          {images.map((img, i) => (
            <div key={i} className="min-w-full snap-center relative">
              <Image
                src={img}
                alt={`${product.title} ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={priority && i === 0}
                loading={i < 2 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {images.map((_, i) => (
              <div
                key={i}
                className={cn("w-1.5 h-1.5 transition-colors duration-0", i === activeIndex ? "bg-white" : "bg-white/50")}
              />
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-b-2xl p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-jakarta font-semibold text-base text-stone-900 min-h-[2lh] line-clamp-2">{product.title}</h3>
            {product.artistName && (
              <span className="text-sm text-stone-500 mt-0.5 block">
                {product.artistName}
              </span>
            )}
          </div>
          <span className="font-grotesk text-sm text-stone-900">{formatPrice(product.minPrice)}</span>
        </div>
      </div>
    </Link>
  );
}
