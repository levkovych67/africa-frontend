"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

function isImageUrl(url: string): boolean {
  return !url.endsWith(".mp4") && !url.endsWith(".webm") && !url.endsWith(".mov");
}

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const filtered = images.filter(isImageUrl);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollTo = useCallback(
    (index: number) => {
      setActiveIndex(index);
      scrollRef.current?.children[index]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    },
    []
  );

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const index = Math.round(scrollLeft / clientWidth);
    setActiveIndex(index);
  }, []);

  if (filtered.length === 0) {
    return (
      <div className="aspect-[3/4] bg-surface-muted flex items-center justify-center">
        <span className="font-mono text-sm text-black/30">
          Немає зображень
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Main image carousel */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-muted">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {filtered.map((src, i) => (
            <div key={i} className="min-w-full snap-center relative">
              <Image
                src={src}
                alt={`${title} ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority={i === 0}
                loading={i < 2 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>

        {/* Arrow navigation */}
        {filtered.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => scrollTo(Math.max(0, activeIndex - 1))}
              className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white border border-black font-mono text-sm ${
                activeIndex === 0 ? "opacity-20 cursor-default" : "hover:bg-black hover:text-white"
              }`}
              disabled={activeIndex === 0}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() =>
                scrollTo(Math.min(filtered.length - 1, activeIndex + 1))
              }
              className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white border border-black font-mono text-sm ${
                activeIndex === filtered.length - 1
                  ? "opacity-20 cursor-default"
                  : "hover:bg-black hover:text-white"
              }`}
              disabled={activeIndex === filtered.length - 1}
            >
              →
            </button>
          </>
        )}

        {/* Counter */}
        {filtered.length > 1 && (
          <div className="absolute bottom-4 right-4 z-10 font-mono text-xs bg-white border border-black px-2 py-1">
            {activeIndex + 1} / {filtered.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {filtered.length > 1 && (
        <div className="flex gap-0 border-t border-black overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filtered.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              className={`relative shrink-0 w-20 h-20 border-r border-black overflow-hidden ${
                i === activeIndex ? "opacity-100" : "opacity-40"
              }`}
            >
              <Image
                src={src}
                alt={`${title} мініатюра ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
