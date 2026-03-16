# Product Card Expansion — Design Spec

## Problem

Clicking a product card navigates to a separate `/product/[slug]` page, which breaks the visual continuity of the blurred hero background. The transition feels abrupt.

## Solution

Replace the navigation with an in-place card expansion animation. When a user taps a product card on the home page, the card smoothly expands into a centered overlay panel showing the full product detail. The blurred hero remains visible behind the overlay backdrop.

## Animation Sequence

1. **Tap** — Record the card's bounding rect. Prevent navigation.
2. **Expanding (~400ms)** — Card animates from its grid position to a centered panel (80% width, 90% height). Backdrop fades in simultaneously.
3. **Expanded** — Full product detail is visible inside the scrollable white panel. Product data fetched via `useProduct(slug)`.
4. **Closing** — Reverse animation. Card shrinks back to its grid position. Backdrop fades out.

## Overlay Panel

- **Size**: 80% viewport width, 90% viewport height, centered
- **Background**: white, `rounded-2xl`
- **Backdrop**: `bg-stone-900/30 backdrop-blur-sm`
- **Content**: scrollable internally (`overflow-y-auto`)
- **Z-index**: above everything (z-50+)

## Close Behavior

- **X button** in top-right corner of the panel
- **Backdrop click** dismisses the overlay
- **Swipe down** on mobile dismisses (only when internal scroll is at top, threshold: 100px drag)
- All close methods reverse the expansion animation

## Expanded Content (top to bottom)

1. Close button (top-right)
2. Image swipe carousel with counter badge (reuse snap-scroll pattern)
3. Product title + price
4. Attribute selectors (size, color — reuse `SizeSelector`)
5. "Додати в кошик" button (reuse `PrecisionButton`)
6. Accordions: Опис, Склад, Доставка (reuse `Accordion`)

## Animation Tech

- **Framer Motion `layoutId`** on the card image and expanded image for automatic FLIP animation
- **Spring**: `stiffness: 300, damping: 30`
- **Backdrop**: `AnimatePresence` with opacity fade (200ms)

## Data Fetching

- On card tap, fetch full product by slug using existing `useProduct(slug)` hook
- Show skeleton placeholder inside expanded panel while loading
- Product card already has: title, price, images, slug — enough for the animation start state

## Architecture

- **No page navigation on home page.** Card click is intercepted, opens overlay instead.
- **`/product/[slug]` page still exists** for direct links, SEO, and sharing.
- **Reuse `CommandCenter` component** inside the expanded overlay — no UI duplication.
- New component: `ProductOverlay` — renders the expanded panel with backdrop, handles close/swipe.
- State: `expandedSlug: string | null` managed at the home page level or via a Zustand slice.

## Files to Create/Modify

- **Create**: `src/components/product/product-overlay.tsx` — the expansion overlay
- **Modify**: `src/components/product/product-card.tsx` — intercept click, share `layoutId`
- **Modify**: `src/components/home/product-feed.tsx` — manage `expandedSlug` state, render overlay
- **Modify**: `src/components/product/image-gallery.tsx` — extract a lightweight carousel for the overlay

## Out of Scope

- URL update on expansion (no history manipulation)
- Desktop-only: no changes to the existing `/product/[slug]` page
- No preloading of product data before tap
