"use client";

import { useEffect, useRef } from "react";

export function ScrollSnap({ targetRef }: { targetRef: React.RefObject<HTMLElement | null> }) {
  const hasSnapped = useRef(false);
  const navbarHeight = 80; // top-20 = 5rem = 80px

  useEffect(() => {
    const handleScroll = () => {
      if (hasSnapped.current) return;

      if (window.scrollY >= 250) {
        hasSnapped.current = true;

        const target = targetRef.current;
        if (!target) return;

        const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

        window.scrollTo({
          top: targetTop,
          behavior: "smooth",
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [targetRef]);

  // Reset snap when user scrolls back to top
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 50) {
        hasSnapped.current = false;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return null;
}
