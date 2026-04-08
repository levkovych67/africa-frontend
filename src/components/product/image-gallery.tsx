"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/cn";
import { FadeImage } from "@/components/ui/fade-image";

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
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const desktopScrollRef = useRef<HTMLDivElement>(null);

  const scrollTo = useCallback(
    (index: number) => {
      setActiveIndex(index);
      desktopScrollRef.current?.children[index]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    },
    []
  );

  const handleMobileScroll = useCallback(() => {
    if (!mobileScrollRef.current) return;
    const { scrollLeft, clientWidth } = mobileScrollRef.current;
    if (clientWidth === 0) return;
    const index = Math.round(scrollLeft / clientWidth);
    setActiveIndex(index);
  }, []);

  const handleDesktopScroll = useCallback(() => {
    if (!desktopScrollRef.current) return;
    const { scrollLeft, clientWidth } = desktopScrollRef.current;
    if (clientWidth === 0) return;
    const index = Math.round(scrollLeft / clientWidth);
    setActiveIndex(index);
  }, []);

  if (filtered.length === 0) {
    return (
      <div className="bg-stone-100 md:rounded-xl overflow-hidden">
        <div className="h-[calc(100dvh-8rem)] md:h-[calc(100dvh-12rem)] flex items-center justify-center">
          <span className="text-sm text-stone-400">
            Немає зображень
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Mobile: full-bleed soft carousel */}
      <div className="relative bg-stone-100 overflow-hidden md:hidden">
        <div className="relative w-full h-[calc(100dvh-8rem)]">
          <div
            ref={mobileScrollRef}
            onScroll={handleMobileScroll}
            className="snap-carousel"
          >
            {filtered.map((src, i) => (
              <div key={i} className="w-full flex-none snap-center relative shimmer-bg">
                <FadeImage
                  src={src}
                  alt={`${title} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={i === 0}
                  loading={i < 2 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>

          {/* Counter badge */}
          {filtered.length > 1 && (
            <div className="absolute bottom-3 right-3 z-10 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 font-grotesk text-xs">
              {activeIndex + 1} / {filtered.length}
            </div>
          )}
        </div>
      </div>

      {/* Desktop: full gallery with arrows and thumbnails */}
      <div className="hidden md:block">
        <div className="relative w-full h-[calc(100dvh-12rem)] rounded-xl overflow-hidden bg-stone-100">
          <div
            ref={desktopScrollRef}
            onScroll={handleDesktopScroll}
            className="snap-carousel"
          >
            {filtered.map((src, i) => (
              <div key={i} className="min-w-full snap-center relative shimmer-bg">
                <FadeImage
                  src={src}
                  alt={`${title} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="66vw"
                  priority={i === 0}
                  loading={i < 2 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>

          {/* Arrow navigation — desktop only */}
          {filtered.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Попереднє зображення"
                onClick={() => scrollTo(Math.max(0, activeIndex - 1))}
                className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-soft font-sans text-sm",
                  activeIndex === 0 ? "opacity-20 cursor-default" : "hover:bg-white hover:shadow-lift"
                )}
                disabled={activeIndex === 0}
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Наступне зображення"
                onClick={() =>
                  scrollTo(Math.min(filtered.length - 1, activeIndex + 1))
                }
                className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-soft font-sans text-sm",
                  activeIndex === filtered.length - 1 ? "opacity-20 cursor-default" : "hover:bg-white hover:shadow-lift"
                )}
                disabled={activeIndex === filtered.length - 1}
              >
                →
              </button>
            </>
          )}

          {/* Counter — desktop */}
          {filtered.length > 1 && (
            <div className="absolute bottom-4 right-4 z-10 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-soft text-xs font-grotesk">
              {activeIndex + 1} / {filtered.length}
            </div>
          )}
        </div>

        {/* Thumbnail strip — desktop only */}
        {filtered.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-none">
            {filtered.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                className={cn("relative shrink-0 w-20 h-20 rounded-lg overflow-hidden shimmer-bg", i === activeIndex ? "opacity-100" : "opacity-40")}
              >
                <FadeImage
                  src={src}
                  alt={`${title} мініатюра ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  quality={50}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
