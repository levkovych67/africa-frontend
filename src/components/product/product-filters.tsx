"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useProductFilters } from "@/hooks/use-product-filters";
import { ArtistFilter, ProductAttribute } from "@/types/product";

export interface ActiveFilters {
  artistId: string | null;
  attributes: Record<string, string[]>;
}

const SIZE_ORDER: Record<string, number> = {
  XXS: 1, XS: 2, S: 3, M: 4, L: 5, XL: 6, XXL: 7, XXXL: 8,
};

function sortAttributeValues(values: string[]): string[] {
  return [...values].sort((a, b) => {
    const aUpper = a.toUpperCase();
    const bUpper = b.toUpperCase();
    if (SIZE_ORDER[aUpper] && SIZE_ORDER[bUpper]) {
      return SIZE_ORDER[aUpper] - SIZE_ORDER[bUpper];
    }
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    if (!isNaN(aNum)) return -1;
    if (!isNaN(bNum)) return 1;
    if (SIZE_ORDER[aUpper]) return -1;
    if (SIZE_ORDER[bUpper]) return 1;
    return a.localeCompare(b);
  });
}

interface ProductFiltersProps {
  filters: ActiveFilters;
  onChange: (filters: ActiveFilters) => void;
}

/* ─── Pill chip — premium glass style ─────────────────────────────── */

function FilterPill({
  label,
  active,
  onClick,
  delay = 0,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  delay?: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.85, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        delay,
      }}
      whileHover={{ scale: 1.06, y: -1 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative px-4 py-2.5 rounded-xl text-[11px] font-jakarta font-bold uppercase tracking-[0.06em]",
        "transition-all duration-300 ease-out cursor-pointer select-none",
        "border backdrop-blur-sm",
        active
          ? "bg-stone-900 text-white border-stone-900 shadow-[0_4px_16px_rgba(28,25,23,0.2)]"
          : "bg-white/80 text-stone-600 border-stone-200/60 hover:bg-white hover:border-stone-300 hover:text-stone-800 hover:shadow-[0_2px_12px_rgba(28,25,23,0.06)]"
      )}
    >
      {/* Active indicator dot */}
      <AnimatePresence>
        {active && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-coral shadow-[0_0_8px_rgba(255,90,95,0.4)]"
          />
        )}
      </AnimatePresence>
      {label}
    </motion.button>
  );
}

/* ─── Section with title accent ─────────────────────────────── */

function FilterSection({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay,
      }}
      className="w-full"
    >
      {/* Section title with decorative lines */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-stone-200/60" />
        <h3 className="font-jakarta font-extrabold text-[10px] uppercase tracking-[0.12em] text-stone-400 whitespace-nowrap">
          {title}
        </h3>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-stone-200/60" />
      </div>
      <div className="flex flex-wrap justify-center gap-2">{children}</div>
    </motion.div>
  );
}

/* ─── Main component ──────────────────────────────────────────────── */

export function ProductFilters({ filters, onChange }: ProductFiltersProps) {
  const { data } = useProductFilters();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const hasFilters =
    (data?.artists && data.artists.length > 0) ||
    (data?.attributes && data.attributes.length > 0);

  const activeCount =
    (filters.artistId ? 1 : 0) +
    Object.values(filters.attributes).reduce((n, v) => n + v.length, 0);

  const clearAll = () => {
    onChange({ artistId: null, attributes: {} });
  };

  const setArtist = (id: string | null) => {
    onChange({ ...filters, artistId: id });
  };

  const toggleAttribute = (type: string, value: string) => {
    const current = filters.attributes[type] || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({
      ...filters,
      attributes: { ...filters.attributes, [type]: next },
    });
  };

  /* ─── Shared filter content ───────────────────────────────────── */

  const filterContent = (inDrawer = false) => {
    const baseDelay = inDrawer ? 0.1 : 0;

    return (
      <div className={cn("space-y-5", !inDrawer && "flex flex-col items-center")}>
        {/* Artists */}
        {data?.artists && data.artists.length > 0 && (
          <FilterSection title="Артист" delay={baseDelay + 0.08}>
            <FilterPill
              label="Всі"
              active={filters.artistId === null}
              onClick={() => setArtist(null)}
              delay={baseDelay + 0.1}
            />
            {data.artists.map((artist: ArtistFilter, i: number) => (
              <FilterPill
                key={artist.id}
                label={artist.name}
                active={filters.artistId === artist.id}
                onClick={() =>
                  setArtist(
                    filters.artistId === artist.id ? null : artist.id
                  )
                }
                delay={baseDelay + 0.12 + i * 0.03}
              />
            ))}
          </FilterSection>
        )}

        {/* Dynamic attributes */}
        {data?.attributes?.map(
          (attr: ProductAttribute, sectionIndex: number) => (
            <FilterSection
              key={attr.type}
              title={attr.type}
              delay={baseDelay + 0.15 + sectionIndex * 0.06}
            >
              {sortAttributeValues(attr.values).map((value, i) => {
                const isActive = (
                  filters.attributes[attr.type] || []
                ).includes(value);
                return (
                  <FilterPill
                    key={value}
                    label={value}
                    active={isActive}
                    onClick={() => toggleAttribute(attr.type, value)}
                    delay={
                      baseDelay + 0.18 + sectionIndex * 0.06 + i * 0.03
                    }
                  />
                );
              })}
            </FilterSection>
          )
        )}

        {/* Clear button */}
        <AnimatePresence>
          {activeCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="pt-1"
            >
              <motion.button
                type="button"
                onClick={clearAll}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="group flex items-center gap-2.5 px-5 py-2.5 rounded-full text-[11px] font-jakarta font-bold uppercase tracking-[0.06em] text-coral bg-coral/8 border border-coral/15 hover:bg-coral/12 hover:border-coral/25 transition-all duration-300"
              >
                {/* X icon */}
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="opacity-60 group-hover:opacity-100 transition-opacity"
                >
                  <line x1="1" y1="1" x2="9" y2="9" />
                  <line x1="9" y1="1" x2="1" y2="9" />
                </svg>
                <span>Скинути</span>
                <span className="font-grotesk text-[11px] tabular-nums opacity-60">
                  ({activeCount})
                </span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      {/* ─── Desktop: premium floating filter bar ─────────────────── */}
      {hasFilters && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.1 }}
          className="hidden md:block mb-12 mx-6 md:mx-8"
        >
          <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl border border-stone-200/40 shadow-[0_4px_24px_rgba(28,25,23,0.04),0_1px_3px_rgba(28,25,23,0.02)] px-8 py-7">
            {/* Subtle top accent line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-[2px] rounded-full bg-stone-300/40" />
            {filterContent()}
          </div>
        </motion.div>
      )}

      {/* ─── Mobile: trigger button ──────────────────────────────── */}
      {hasFilters && <div className="md:hidden flex items-center gap-3 px-6 mb-6">
        <motion.button
          type="button"
          onClick={() => setMobileOpen(true)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="
            flex items-center gap-2.5 px-5 py-3 rounded-xl
            bg-white/70 backdrop-blur-md border border-stone-200/50
            shadow-[0_2px_12px_rgba(28,25,23,0.04)]
            text-[11px] font-jakarta font-bold uppercase tracking-[0.06em] text-stone-700
            transition-all duration-300
            hover:bg-white hover:shadow-[0_4px_16px_rgba(28,25,23,0.06)]
          "
        >
          {/* Filter icon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-stone-500"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span>Фільтри</span>

          {/* Active count badge */}
          <AnimatePresence>
            {activeCount > 0 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="
                  min-w-[20px] h-5 px-1 rounded-full
                  bg-coral text-white font-grotesk text-[10px]
                  flex items-center justify-center
                  shadow-[0_0_8px_rgba(255,90,95,0.3)]
                "
              >
                {activeCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>}

      {/* ─── Mobile drawer (bottom sheet) ──────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="filter-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-lg md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              key="filter-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="fixed inset-x-0 bottom-0 z-50 md:hidden"
            >
              <div className="bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-[0_-8px_40px_rgba(28,25,23,0.12)] max-h-[85vh] flex flex-col">
                {/* Handle + header */}
                <div className="pt-3 pb-4 px-6 flex-shrink-0">
                  <div className="w-10 h-1 rounded-full bg-stone-300/60 mx-auto mb-5" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="font-jakarta font-extrabold text-xs uppercase tracking-[0.08em]">
                        Фільтри
                      </h2>
                      <AnimatePresence>
                        {activeCount > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="min-w-[20px] h-5 px-1 rounded-full bg-coral text-white font-grotesk text-[10px] flex items-center justify-center"
                          >
                            {activeCount}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <button
                      type="button"
                      aria-label="Закрити фільтри"
                      onClick={() => setMobileOpen(false)}
                      className="
                        w-8 h-8 rounded-full bg-stone-100
                        flex items-center justify-center
                        text-stone-400 hover:text-stone-600 hover:bg-stone-200
                        transition-all duration-200
                      "
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="1" y1="1" x2="9" y2="9" />
                        <line x1="9" y1="1" x2="1" y2="9" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto px-6 pb-8 flex-1 scrollbar-none">
                  {filterContent(true)}
                </div>

                {/* Apply footer */}
                <div className="flex-shrink-0 px-6 py-4 border-t border-stone-100/80 bg-white/80 backdrop-blur-sm">
                  <div className="flex gap-3">
                    {/* Clear all (conditional) */}
                    <AnimatePresence>
                      {activeCount > 0 && (
                        <motion.button
                          type="button"
                          onClick={clearAll}
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="rounded-xl py-3.5 px-5 font-jakarta font-bold text-[11px] uppercase tracking-[0.06em] text-stone-500 border border-stone-200 hover:border-stone-300 transition-colors whitespace-nowrap"
                        >
                          Очистити
                        </motion.button>
                      )}
                    </AnimatePresence>
                    <motion.button
                      type="button"
                      onClick={() => setMobileOpen(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 rounded-xl py-3.5 px-8 font-jakarta font-bold text-[11px] uppercase tracking-[0.06em] bg-stone-900 text-white hover:shadow-lift transition-all duration-300"
                    >
                      Показати товари
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
