"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate,
} from "framer-motion";
import Image from "next/image";
import { useProduct } from "@/hooks/use-products";
import { CommandCenter } from "./command-center";

function isImageUrl(url: string): boolean {
  return !url.endsWith(".mp4") && !url.endsWith(".webm") && !url.endsWith(".mov");
}

interface ProductOverlayProps {
  slug: string;
  onClose: () => void;
}

function OverlayCarousel({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const filtered = images.filter(isImageUrl);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    if (clientWidth === 0) return;
    setActiveIndex(Math.round(scrollLeft / clientWidth));
  }, []);

  if (filtered.length === 0) {
    return (
      <div className="aspect-[4/5] bg-stone-100 flex items-center justify-center">
        <span className="text-sm text-stone-400">Немає зображень</span>
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100 rounded-2xl">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {filtered.map((src, i) => (
          <div key={i} className="w-full flex-none snap-center relative">
            <Image
              src={src}
              alt={`${title} ${i + 1}`}
              fill
              className="object-cover"
              sizes="80vw"
              priority={i === 0}
              loading={i < 2 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>
      {filtered.length > 1 && (
        <div className="absolute bottom-3 right-3 z-10 bg-white border border-stone-200 px-2 py-1 text-xs font-grotesk">
          {activeIndex + 1} / {filtered.length}
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
  const [showClose, setShowClose] = useState(false);

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
    // Show close button after scrolling 100px
    if (el.scrollTop > 100 && !showClose) {
      setShowClose(true);
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
  }, [showClose, cardY]);

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
      if (!pullUnlockedRef.current) return false; // not unlocked yet — wait for next gesture
      if (scrollDelta <= 0) return false;

      isPullingRef.current = true;
      pullAccumRef.current += scrollDelta;

      // iOS resistance: progressively harder
      const resistedY = -(pullAccumRef.current * pullResistance);
      cardY.set(resistedY);

      // Past threshold? Eject.
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
      // Unlock pull if this NEW gesture starts while already at bottom
      if (isAtBottomRef.current) {
        pullUnlockedRef.current = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isEjecting) return;
      const currentY = e.touches[0].clientY;
      const delta = lastTouchYRef.current - currentY; // positive = scrolling down
      lastTouchYRef.current = currentY;

      // Re-check bottom on every move
      checkBottom();

      if (isPullingRef.current || (isAtBottomRef.current && delta > 0)) {
        if (delta < 0 && isPullingRef.current) {
          // Reversing while pulling — reduce accumulator
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

      // Check bottom after current scroll frame
      checkBottom();

      // If at bottom but not yet unlocked, consume downward scroll and wait for settle
      if (isAtBottomRef.current && !pullUnlockedRef.current && e.deltaY > 0) {
        e.preventDefault();
        // After wheel momentum stops (200ms), unlock for next scroll
        if (settleTimer) clearTimeout(settleTimer);
        settleTimer = setTimeout(() => {
          if (isAtBottomRef.current) {
            pullUnlockedRef.current = true;
          }
        }, 100);
        return;
      }

      // Use rAF to re-check after browser applies scroll
      if (!isAtBottomRef.current && !isPullingRef.current) {
        requestAnimationFrame(() => checkBottom());
        return;
      }

      if (e.deltaY <= 0) {
        // Scrolling up — if we're pulling, reverse
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

      // Scrolling down at bottom — apply rubber band
      if (applyPull(e.deltaY)) {
        e.preventDefault();

        // Debounced release: if wheel stops, evaluate threshold
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

          {/* Scrollable wrapper — scrolls the card itself */}
          <div
            ref={scrollRef}
            onScroll={checkBottom}
            className="fixed inset-x-0 top-20 bottom-0 z-50 overflow-y-auto overscroll-none pointer-events-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="px-4 pb-4">
              <motion.div
                key="overlay-card"
                initial={{ y: "100vh" }}
                animate={{ y: 0 }}
                exit={{ y: "100vh" }}
                transition={{
                  type: "spring",
                  damping: 30,
                  stiffness: 300,
                  mass: 0.8,
                }}
                style={{ y: cardY }}
                className="bg-white rounded-3xl shadow-lift"
              >
                <div className="px-6 pt-6 pb-6">
                  {isLoading || !product ? (
                    <div className="space-y-4">
                      <div className="aspect-[4/5] bg-stone-100 animate-pulse" />
                      <div className="h-6 w-3/4 bg-stone-100 animate-pulse" />
                      <div className="h-5 w-1/4 bg-stone-100 animate-pulse" />
                      <div className="grid grid-cols-4 gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="h-12 bg-stone-100 animate-pulse" />
                        ))}
                      </div>
                      <div className="h-12 bg-stone-100 animate-pulse" />
                    </div>
                  ) : (
                    <>
                      <OverlayCarousel images={product.images} title={product.title} />
                      <div className="mt-4">
                        <CommandCenter product={product} compact />
                      </div>
                    </>
                  )}
                </div>

                {/* Close button — appears after scrolling */}
                {showClose && (
                  <div
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center py-3 cursor-pointer bg-stone-50/80 backdrop-blur-sm"
                  >
                    <span className="font-jakarta text-[9px] text-stone-500 uppercase tracking-wider">закрити</span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Extra space below card for rubber-band overscroll */}
            <div className="h-32" />
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
