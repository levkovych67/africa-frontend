"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
    // Both are letter sizes (S, M, L, etc.)
    if (SIZE_ORDER[aUpper] && SIZE_ORDER[bUpper]) {
      return SIZE_ORDER[aUpper] - SIZE_ORDER[bUpper];
    }
    // Try numeric/range comparison (e.g. "35-38", "43-46")
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    // Numbers before letters
    if (!isNaN(aNum)) return -1;
    if (!isNaN(bNum)) return 1;
    // Letter sizes before unknown strings
    if (SIZE_ORDER[aUpper]) return -1;
    if (SIZE_ORDER[bUpper]) return 1;
    return a.localeCompare(b);
  });
}

interface ProductFiltersProps {
  filters: ActiveFilters;
  onChange: (filters: ActiveFilters) => void;
}

/* ─── Pill chip with layout animation ─────────────────────────────── */

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
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        delay,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        px-4 py-2 rounded-full text-xs font-jakarta font-bold uppercase tracking-wider
        transition-colors duration-200
        ${
          active
            ? "bg-stone-900 text-white shadow-soft"
            : "bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700"
        }
      `}
    >
      {label}
    </motion.button>
  );
}

/* ─── Section with staggered children ─────────────────────────────── */

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
    >
      <h3 className="font-jakarta font-bold text-[10px] uppercase tracking-[0.08em] text-stone-400 mb-3">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">{children}</div>
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
      <div className={`space-y-6 ${inDrawer ? "" : ""}`}>
        {/* Artists */}
        {data?.artists && data.artists.length > 0 && (
          <FilterSection
            title="Артист"
            delay={baseDelay + 0.08}
          >
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

        {/* Clear */}
        <AnimatePresence>
          {activeCount > 0 && (
            <motion.button
              type="button"
              onClick={clearAll}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-jakarta font-bold uppercase tracking-wider text-coral bg-coral/10 hover:bg-coral/15 transition-colors"
            >
              <span>Скинути</span>
              <span className="font-grotesk text-[11px] tabular-nums">
                ({activeCount})
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      {/* ─── Desktop: inline filter bar ────────────────────────────── */}
      <div className="hidden md:block mb-10 px-6 md:px-8">
        {filterContent()}
      </div>

      {/* ─── Mobile: trigger button + sort quick-access ────────────── */}
      <div className="md:hidden flex items-center gap-3 px-6 mb-6">
        <motion.button
          type="button"
          onClick={() => setMobileOpen(true)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white shadow-soft text-xs font-jakarta font-bold uppercase tracking-wider text-stone-700"
        >
          {/* Filter icon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="20" y2="12" />
            <line x1="12" y1="18" x2="20" y2="18" />
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
                className="w-5 h-5 rounded-full bg-coral text-white font-grotesk text-[10px] flex items-center justify-center"
              >
                {activeCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

      </div>

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
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-stone-900/30 backdrop-blur-md md:hidden"
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
              <div className="bg-white rounded-t-3xl shadow-lift max-h-[85vh] flex flex-col">
                {/* Handle + header */}
                <div className="pt-3 pb-4 px-6 flex-shrink-0">
                  <div className="w-10 h-1 rounded-full bg-stone-200 mx-auto mb-4" />
                  <div className="flex items-center justify-between">
                    <h2 className="font-jakarta font-bold text-xs uppercase tracking-widest">
                      Фільтри
                    </h2>
                    <button
                      type="button"
                      onClick={() => setMobileOpen(false)}
                      className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-200 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto px-6 pb-8 flex-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {filterContent(true)}
                </div>

                {/* Apply footer */}
                <div className="flex-shrink-0 px-6 py-4 border-t border-stone-100">
                  <motion.button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full rounded-full py-3.5 px-8 font-jakarta font-bold text-xs uppercase tracking-wider bg-stone-900 text-white hover:shadow-lift transition-shadow"
                  >
                    Показати товари
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
