"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils/price";

function isImageUrl(url: string): boolean {
  return !url.endsWith(".mp4") && !url.endsWith(".webm") && !url.endsWith(".mov");
}

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const images = product.images.filter(isImageUrl);
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
      <div className="block p-4">
        <div className="aspect-square bg-surface-muted mb-4 flex items-center justify-center">
          <span className="font-mono text-xs text-black/30">Немає фото</span>
        </div>
        <div className="flex justify-between items-start">
          <h3 className="text-base font-serif italic">{product.title}</h3>
          <span className="text-sm font-mono">{formatPrice(product.basePrice)}</span>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block p-4 cursor-pointer hover:bg-surface-muted transition-none"
    >
      {/* Desktop: hover zone carousel */}
      <div
        className="relative aspect-square bg-surface-muted mb-4 overflow-hidden hidden md:block"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Always render first image */}
        <Image
          src={images[0]}
          alt={`${product.title} 1`}
          fill
          className={`object-cover w-full h-full mix-blend-multiply transition-opacity duration-200 ease-in-out ${
            activeIndex === 0 ? "opacity-100" : "opacity-0"
          }`}
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
              className={`object-cover w-full h-full mix-blend-multiply transition-opacity duration-200 ease-in-out ${
                i + 1 === activeIndex ? "opacity-100" : "opacity-0"
              }`}
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
          ))}

        {/* Segment indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-3 right-3 flex gap-1 z-10">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-[2px] flex-1 transition-colors duration-0 ${
                  i === activeIndex ? "bg-black" : "bg-black/20"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile: snap-scroll carousel — only first 2 images eager, rest lazy */}
      <div className="relative aspect-square bg-surface-muted mb-4 overflow-hidden md:hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, i) => (
            <div key={i} className="min-w-full snap-center relative">
              <Image
                src={img}
                alt={`${product.title} ${i + 1}`}
                fill
                className="object-cover mix-blend-multiply"
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
                className={`w-1.5 h-1.5 transition-colors duration-0 ${
                  i === activeIndex ? "bg-black" : "bg-black/25"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-start">
        <h3 className="text-base font-serif font-bold">{product.title}</h3>
        <span className="text-sm font-mono">{formatPrice(product.basePrice)}</span>
      </div>
    </Link>
  );
}
