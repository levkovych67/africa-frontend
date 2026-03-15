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
      <div className="border border-black p-2 bg-white md:rounded-xl md:border-0 md:p-0 md:bg-stone-100 md:overflow-hidden">
        <div className="aspect-[4/5] bg-stone-100 flex items-center justify-center">
          <span className="text-sm text-stone-400">
            Немає зображень
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Mobile: framed image carousel */}
      <div className="relative border border-black p-2 bg-white md:hidden">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <div
            ref={mobileScrollRef}
            onScroll={handleMobileScroll}
            className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filtered.map((src, i) => (
              <div key={i} className="w-full flex-none snap-center relative">
                <Image
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

          {/* Counter badge — brutalist rectangle */}
          {filtered.length > 1 && (
            <div className="absolute bottom-2 right-2 z-10 bg-white border border-black px-2 py-1 font-grotesk text-[10px] tracking-widest">
              {activeIndex + 1} / {filtered.length}
            </div>
          )}
        </div>
      </div>

      {/* Desktop: full gallery with arrows and thumbnails */}
      <div className="hidden md:block">
        <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-stone-100">
          <div
            ref={desktopScrollRef}
            onScroll={handleDesktopScroll}
            className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filtered.map((src, i) => (
              <div key={i} className="min-w-full snap-center relative">
                <Image
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
                onClick={() => scrollTo(Math.max(0, activeIndex - 1))}
                className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-soft font-sans text-sm ${
                  activeIndex === 0 ? "opacity-20 cursor-default" : "hover:bg-white hover:shadow-lift"
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
                className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-soft font-sans text-sm ${
                  activeIndex === filtered.length - 1
                    ? "opacity-20 cursor-default"
                    : "hover:bg-white hover:shadow-lift"
                }`}
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
          <div className="flex gap-2 mt-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filtered.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
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
    </div>
  );
}
