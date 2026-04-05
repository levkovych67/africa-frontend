"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate,
} from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { useProduct } from "@/hooks/use-products";
import { CommandCenter } from "./command-center";

function isImageUrl(url: string): boolean {
  return !url.endsWith(".mp4") && !url.endsWith(".webm") && !url.endsWith(".mov");
}

interface ProductOverlayProps {
  slug: string;
  onClose: () => void;
}

function OverlayGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const filtered = images.filter(isImageUrl);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollTo = useCallback((index: number) => {
    setActiveIndex(index);
    scrollRef.current?.children[index]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    if (clientWidth === 0) return;
    setActiveIndex(Math.round(scrollLeft / clientWidth));
  }, []);

  if (filtered.length === 0) {
    return (
      <div className="aspect-[3/4] bg-stone-100 rounded-2xl flex items-center justify-center">
        <span className="text-sm text-stone-400">Немає зображень</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Main image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100 rounded-2xl">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="snap-carousel"
        >
          {filtered.map((src, i) => (
            <div key={i} className="w-full flex-none snap-center relative">
              <Image
                src={src}
                alt={`${title} ${i + 1}`}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 45vw, 85vw"
                priority={i === 0}
                loading={i < 2 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        {filtered.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => scrollTo(Math.max(0, activeIndex - 1))}
              className={cn(
                "absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full text-xs transition-opacity",
                activeIndex === 0 ? "opacity-0 pointer-events-none" : "opacity-100 hover:bg-white"
              )}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollTo(Math.min(filtered.length - 1, activeIndex + 1))}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full text-xs transition-opacity",
                activeIndex === filtered.length - 1 ? "opacity-0 pointer-events-none" : "opacity-100 hover:bg-white"
              )}
            >
              →
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {filtered.length > 1 && (
        <div className="flex gap-1.5">
          {filtered.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              className={cn(
                "relative shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-opacity duration-200",
                i === activeIndex ? "opacity-100 ring-2 ring-stone-900" : "opacity-50 hover:opacity-80"
              )}
            >
              <Image
                src={src}
                alt={`${title} мініатюра ${i + 1}`}
                fill
                className="object-cover"
                sizes="56px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── iOS Rubber Band Dismissal ──────────────────────────────────────

export function ProductOverlay({ slug, onClose }: ProductOverlayProps) {
  const { data: product, isLoading } = useProduct(slug);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [isEjecting, setIsEjecting] = useState(false);

  // Physics wrapper Y — the "rubber band" axis
  const cardY = useMotionValue(0);

  // Rubber band state
  const isAtBottomRef = useRef(false);
  const pullAccumRef = useRef(0);
  const lastTouchYRef = useRef(0);
  const isPullingRef = useRef(false);

  // Gate: pull only unlocks on a NEW gesture that starts while already at bottom
  const pullUnlockedRef = useRef(false);

  // iOS resistance — progressively harder to pull
  const pullResistance = 0.35;
  // Ejection threshold in card-pixels (not scroll-pixels)
  const ejectionThreshold = 70;

  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ─── Scroll edge detection ────────────────────────────────────────
  const wasAtBottomRef = useRef(false);

  const checkBottom = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const atBottom = Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 1;
    isAtBottomRef.current = atBottom;
    // Reset unlock if user scrolls away from bottom
    if (!atBottom) {
      pullUnlockedRef.current = false;
    }
    // Bounce when first hitting bottom
    if (atBottom && !wasAtBottomRef.current && !isPullingRef.current) {
      cardY.set(0);
      requestAnimationFrame(() => {
        animate(cardY, -12, {
          type: "spring",
          stiffness: 600,
          damping: 15,
        }).then(() => {
          animate(cardY, 0, {
            type: "spring",
            stiffness: 500,
            damping: 30,
          });
        });
      });
    }
    wasAtBottomRef.current = atBottom;
  }, [cardY]);

  // ─── Ejection: card flies up off screen ───────────────────────────
  const ejectCard = useCallback(() => {
    if (isEjecting) return;
    setIsEjecting(true);
    animate(cardY, -window.innerHeight, {
      ease: "easeOut",
      duration: 0.25,
    }).then(() => onClose());
  }, [isEjecting, cardY, onClose]);

  // ─── Snap back: rubber band release ───────────────────────────────
  const snapBack = useCallback(() => {
    pullAccumRef.current = 0;
    isPullingRef.current = false;
    animate(cardY, 0, {
      type: "spring",
      stiffness: 500,
      damping: 40,
    });
  }, [cardY]);

  // ─── Apply rubber band pull (returns true if consumed) ────────────
  const applyPull = useCallback(
    (scrollDelta: number): boolean => {
      if (isEjecting) return false;
      if (!isAtBottomRef.current) return false;
      if (!pullUnlockedRef.current) return false;
      if (scrollDelta <= 0) return false;

      isPullingRef.current = true;
      pullAccumRef.current += scrollDelta;

      const resistedY = -(pullAccumRef.current * pullResistance);
      cardY.set(resistedY);

      if (pullAccumRef.current * pullResistance >= ejectionThreshold) {
        ejectCard();
      }

      return true;
    },
    [isEjecting, cardY, ejectCard]
  );

  // ─── Touch events ─────────────────────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      lastTouchYRef.current = e.touches[0].clientY;
      checkBottom();
      if (isAtBottomRef.current) {
        pullUnlockedRef.current = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isEjecting) return;
      const currentY = e.touches[0].clientY;
      const delta = lastTouchYRef.current - currentY;
      lastTouchYRef.current = currentY;

      checkBottom();

      if (isPullingRef.current || (isAtBottomRef.current && delta > 0)) {
        if (delta < 0 && isPullingRef.current) {
          pullAccumRef.current = Math.max(0, pullAccumRef.current + delta);
          if (pullAccumRef.current <= 0) {
            snapBack();
            return;
          }
          const resistedY = -(pullAccumRef.current * pullResistance);
          cardY.set(resistedY);
          return;
        }

        if (applyPull(delta)) {
          e.preventDefault();
        }
      }
    };

    const onTouchEnd = () => {
      if (isEjecting) return;
      if (isPullingRef.current) {
        const resistedDistance = pullAccumRef.current * pullResistance;
        if (resistedDistance >= ejectionThreshold) {
          ejectCard();
        } else {
          snapBack();
        }
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [isEjecting, cardY, checkBottom, applyPull, snapBack, ejectCard]);

  // ─── Wheel events (desktop trackpad) ──────────────────────────────
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let settleTimer: ReturnType<typeof setTimeout> | null = null;

    const onWheel = (e: WheelEvent) => {
      if (isEjecting) return;

      checkBottom();

      if (isAtBottomRef.current && !pullUnlockedRef.current && e.deltaY > 0) {
        e.preventDefault();
        if (settleTimer) clearTimeout(settleTimer);
        settleTimer = setTimeout(() => {
          if (isAtBottomRef.current) {
            pullUnlockedRef.current = true;
          }
        }, 100);
        return;
      }

      if (!isAtBottomRef.current && !isPullingRef.current) {
        requestAnimationFrame(() => checkBottom());
        return;
      }

      if (e.deltaY <= 0) {
        if (isPullingRef.current) {
          pullAccumRef.current = Math.max(0, pullAccumRef.current + e.deltaY);
          if (pullAccumRef.current <= 0) {
            snapBack();
            return;
          }
          const resistedY = -(pullAccumRef.current * pullResistance);
          cardY.set(resistedY);
          e.preventDefault();
        }
        return;
      }

      if (applyPull(e.deltaY)) {
        e.preventDefault();

        if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
        wheelTimerRef.current = setTimeout(() => {
          if (isEjecting) return;
          if (isPullingRef.current) {
            const resistedDistance = pullAccumRef.current * pullResistance;
            if (resistedDistance >= ejectionThreshold) {
              ejectCard();
            } else {
              snapBack();
            }
          }
        }, 150);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      if (settleTimer) clearTimeout(settleTimer);
    };
  }, [isEjecting, cardY, checkBottom, applyPull, snapBack, ejectCard]);

  return (
    <AnimatePresence onExitComplete={onClose}>
      {isOpen && (
        <>
          {/* Backdrop blur layer */}
          <motion.div
            key="overlay-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-0 z-50 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />
          {/* Backdrop tint layer */}
          <motion.div
            key="overlay-tint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-0 z-50 bg-stone-900/30"
            onClick={() => setIsOpen(false)}
          />

          {/* Entrance/exit animation wrapper */}
          <motion.div
            key="overlay-entrance"
            initial={{ y: "100vh" }}
            animate={{ y: 0 }}
            exit={{ y: "100vh" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
              mass: 0.8,
            }}
            className="fixed inset-x-0 top-16 bottom-0 z-50"
          >
            {/* Scrollable wrapper */}
            <motion.div
              ref={scrollRef}
              onScroll={checkBottom}
              style={{ y: cardY }}
              className="h-full overflow-y-auto overscroll-none pointer-events-auto scrollbar-none"
            >
              <div className="h-4" />
              <div className="px-4 pb-4">
                <div className="bg-white rounded-3xl shadow-lift relative">
                  {/* Close button — always visible */}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-stone-500 hover:bg-stone-900 hover:text-white transition-all duration-200"
                  >
                    ✕
                  </button>

                  <div className="p-5 md:p-6 relative">
                    {/* Zebra background */}
                    <Image
                      src="/images/zebra.webp"
                      alt=""
                      fill
                      className="object-cover rounded-3xl"
                      sizes="100vw"
                      aria-hidden="true"
                    />
                    <div className="relative z-[1]">
                      {isLoading || !product ? (
                        <div className="space-y-4">
                          <div className="aspect-[3/4] bg-stone-100 rounded-2xl animate-pulse" />
                          <div className="h-6 w-3/4 bg-stone-100 rounded-xl animate-pulse" />
                          <div className="h-5 w-1/4 bg-stone-100 rounded-xl animate-pulse" />
                          <div className="grid grid-cols-4 gap-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <div key={i} className="h-12 bg-stone-100 rounded-xl animate-pulse" />
                            ))}
                          </div>
                          <div className="h-12 bg-stone-100 rounded-xl animate-pulse" />
                        </div>
                      ) : (
                        <div className="md:grid md:grid-cols-2 md:gap-6">
                          {/* Left — gallery */}
                          <div>
                            <OverlayGallery images={product.images} title={product.title} />
                          </div>

                          {/* Right — product info */}
                          <div className="mt-4 md:mt-0">
                            <CommandCenter product={product} compact />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra space below card for rubber-band overscroll */}
              <div className="h-32" />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
