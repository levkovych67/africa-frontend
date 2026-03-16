"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
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
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
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

export function ProductOverlay({ slug, onClose }: ProductOverlayProps) {
  const { data: product, isLoading } = useProduct(slug);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [isEjecting, setIsEjecting] = useState(false);

  // Motion values for the sheet
  const sheetY = useMotionValue(0);
  const sheetOpacity = useMotionValue(1);

  // Overscroll state
  const atBottomRef = useRef(false);
  const overscrollAccum = useRef(0);
  const lastTouchY = useRef(0);
  const isOverscrolling = useRef(false);

  const releaseThreshold = 120; // px of sheet translation before ejection
  const resistance = 0.4; // 2.5px scroll = 1px movement

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Eject — fade out and close
  const eject = useCallback(() => {
    if (isEjecting) return;
    setIsEjecting(true);
    animate(sheetOpacity, 0, {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1],
    }).then(() => {
      onClose();
    });
  }, [isEjecting, sheetOpacity, onClose]);

  // Snap the sheet back to y=0 with critically damped spring
  const snapBack = useCallback(() => {
    overscrollAccum.current = 0;
    isOverscrolling.current = false;
    animate(sheetY, 0, {
      type: "spring",
      stiffness: 800,
      damping: 40,
    });
  }, [sheetY]);

  // Apply overscroll offset with resistance
  const applyOverscroll = useCallback(
    (delta: number) => {
      if (isEjecting) return false;

      // Not at bottom or scrolling up — don't consume, but don't snap back here
      if (!atBottomRef.current || delta <= 0) {
        return false;
      }

      isOverscrolling.current = true;
      overscrollAccum.current += delta * resistance;

      const offset = -overscrollAccum.current; // negative = sheet moves up
      sheetY.set(offset);

      // Check if past breaking point
      if (overscrollAccum.current >= releaseThreshold) {
        eject();
      }

      return true; // consumed the event
    },
    [isEjecting, sheetY, eject]
  );

  // Track scroll position to detect bottom
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    atBottomRef.current =
      el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
  }, []);

  // Pull-down-from-top drag dismiss (existing mechanic)
  const [canDragDown, setCanDragDown] = useState(true);
  const handleScrollForDrag = useCallback(() => {
    if (!scrollRef.current) return;
    setCanDragDown(scrollRef.current.scrollTop <= 0);
    handleScroll();
  }, [handleScroll]);

  // Wheel: overscroll ejection at bottom with debounced snap-back
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let wheelEndTimer: ReturnType<typeof setTimeout> | null = null;

    const handleWheel = (e: WheelEvent) => {
      if (isEjecting) return;

      // Clear any pending snap-back
      if (wheelEndTimer) clearTimeout(wheelEndTimer);

      if (applyOverscroll(e.deltaY)) {
        e.preventDefault();
      }

      // After wheel stops (150ms idle), snap back if below threshold
      if (isOverscrolling.current) {
        wheelEndTimer = setTimeout(() => {
          if (!isEjecting && isOverscrolling.current && overscrollAccum.current < releaseThreshold) {
            snapBack();
          }
        }, 150);
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      if (wheelEndTimer) clearTimeout(wheelEndTimer);
    };
  }, [applyOverscroll, isEjecting, snapBack]);

  // Touch: overscroll ejection at bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      lastTouchY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isEjecting) return;
      const currentY = e.touches[0].clientY;
      const delta = lastTouchY.current - currentY; // positive = scrolling down
      lastTouchY.current = currentY;
      applyOverscroll(delta);
    };

    const handleTouchEnd = () => {
      if (isEjecting) return;
      if (isOverscrolling.current && overscrollAccum.current < releaseThreshold) {
        snapBack();
      }
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [applyOverscroll, snapBack, isEjecting]);

  return (
    <AnimatePresence onExitComplete={onClose}>
      {isOpen && (
        <>
          {/* Overlay — solid dark */}
          <motion.div
            key="overlay-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-stone-900/30 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Sheet wrapper — handles pull-down drag from top */}
          <motion.div
            key="overlay-sheet"
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{
              duration: 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            drag={canDragDown ? "y" : false}
            dragDirectionLock
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.08}
            dragTransition={{
              bounceStiffness: 800,
              bounceDamping: 40,
            }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 150) {
                handleClose();
              }
            }}
            className="fixed inset-x-0 top-20 bottom-4 left-4 right-4 z-50"
          >
            {/* Inner sheet — moves with overscroll ejection */}
            <motion.div
              style={{ y: sheetY, opacity: sheetOpacity }}
              className="absolute inset-0 bg-white rounded-3xl shadow-lift flex flex-col overflow-hidden"
            >
              {/* Scrollable content */}
              <div
                ref={scrollRef}
                onScroll={handleScrollForDrag}
                className="flex-1 overflow-y-auto overscroll-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
              </div>

              {/* Drag handle — bottom: pull up to fade & close */}
              <div
                onClick={handleClose}
                onTouchStart={(e) => {
                  lastTouchY.current = e.touches[0].clientY;
                }}
                onTouchMove={(e) => {
                  const pulled = lastTouchY.current - e.touches[0].clientY;
                  if (pulled > 0) {
                    const fade = Math.max(0, 1 - pulled / 180);
                    sheetOpacity.set(fade);
                  }
                }}
                onTouchEnd={(e) => {
                  const pulled = lastTouchY.current - e.changedTouches[0].clientY;
                  if (pulled > 180) {
                    eject();
                  } else {
                    animate(sheetOpacity, 1, { duration: 0.15 });
                  }
                }}
                className="flex justify-center py-4 cursor-pointer"
              >
                <div className="w-10 h-1 bg-stone-300 rounded-full" />
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
