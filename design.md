# AFRICA SHOP — Design System Documentation

**Version:** 1.1 (Elegant Brutalism Update)
**Last Updated:** March 2026
**Platform:** Web (Next.js / Tailwind CSS)
**Language:** Ukrainian (uk)

---

## 1. Design Philosophy

The AFRICA SHOP visual identity follows an **Elegant Brutalist** aesthetic. The guiding principle is raw precision paired with editorial restraint — every element communicates function through stark contrast, strict geometry, and expansive negative space. The store sells limited-edition merchandise for the "AFRICA" brand, targeting a Ukrainian-speaking audience.

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Zero Shadows** | `box-shadow` is globally forbidden. Depth is achieved exclusively through 1px solid borders and stark color blocking. |
| **Brutal Geometry** | `border-radius: 0px` on every element — buttons, inputs, images, drawers, cards. No exceptions. |
| **Optical Comfort** | Pure black (`#000000`) is reserved strictly for 1px borders. Text uses an off-black (`#0A0A0A`) to prevent digital halation and eye strain on high-nit OLED/Retina displays. |
| **Mechanical Snap** | Animations feel like high-end industrial machinery — incredibly fast (75ms) and critically damped, never soft or floating. |
| **Editorial Negative Space** | Dense, aggressive typography is balanced by vast empty spaces, mimicking high-fashion print layouts. Generous padding (`p-6` / `p-8`) lets content float inside its geometric cage. |

---

## 2. Color Palette

The palette is intentionally minimal, acting as a structural framework rather than decoration.

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| **Background Primary** | `#FFFFFF` | `bg-white` | Global page background, default button text, cart drawer background |
| **Ink Primary** | `#0A0A0A` | `text-ink-primary` | All body text, headings, primary button fill. Off-black avoids Retina display halation. |
| **Structural Black** | `#000000` | `border-black` | Strictly for 1px borders and grid lines to maintain razor-sharp structure. |
| **Gallery Surface** | `#F5F5F0` | `bg-surface-muted` | Empty image placeholders, product card hover states. A slightly warm tone avoids "dead" digital gray. |
| **Alert** | `#FF0000` | `text-alert` / `border-alert` | "РОЗПРОДАНО" (Sold Out) badges, form errors. **Never used decoratively.** |
| **Overlay** | `#0A0A0A` at 90% opacity | `bg-[#0A0A0A]/90` | Cart drawer backdrop overlay. No blur — stark, intentional, raw. |
| **Transparency** | `transparent` | `bg-transparent` | Input field default background |

### Color Rules

- No gradients anywhere in the application.
- No colored backgrounds on sections — only `#FFFFFF`, `#F5F5F0`, or `#000000`.
- The `#FF0000` alert color is strictly reserved for error states and sold-out indicators. It must never appear as a decorative or branding element.
- Text always renders in `#0A0A0A` (ink-primary), never pure `#000000`. Borders always use pure `#000000`.
- Opacity is used sparingly: `opacity-30` for disabled states, `opacity-40` for inactive thumbnails, `black/40` for placeholder text, `black/60` for secondary metadata, `black/20`–`black/25` for inactive carousel indicators.

---

## 3. Typography

### Font Stack

| Font | Family Type | Source | CSS Variable | Subsets | Usage |
|------|-------------|--------|--------------|---------|-------|
| **Inter** | Sans-serif | Google Fonts | `--font-inter` | Cyrillic, Latin | Headings, body text |
| **JetBrains Mono** | Monospace | Google Fonts | `--font-jetbrains-mono` | Cyrillic, Latin | UI controls, buttons, labels, prices, data, navigation |
| **Web Serveroff** | Serif (display) | Local file (`/fonts/Web Serveroff.ttf`) | `--font-serveroff` | — | Product titles on cards and detail pages |

### Tailwind Font Classes

```
font-sans  → Inter (+ Helvetica Neue, Arial fallbacks)
font-mono  → JetBrains Mono (+ Courier New fallback)
font-serif → Web Serveroff (+ Georgia fallback)
```

### Type Scale

| Style | CSS Class | Font | Size | Weight | Tracking | Line Height | Usage |
|-------|-----------|------|------|--------|----------|-------------|-------|
| **H1 Hero** | `.text-h1-hero` | Inter | `clamp(2.5rem, 8vw, 6rem)` | 700 (Bold) | `-0.02em` | 1.0 | Hero section headlines. Allowed to intentionally break grid boundaries for editorial impact. |
| **H2 Section** | `.text-h2-section` | Inter | `clamp(1.5rem, 4vw, 2.5rem)` | 600 (Semibold) | `-0.01em` | 1.1 | Product detail title, section headings |
| **Body Prose** | `.text-body-prose` | Inter | `1rem` (16px) | 400 (Regular) | `0em` | 1.5 | Long-form descriptions. Tightened line height creates a blockier, architectural text shape. |
| **Tech/Data** | `.text-tech-data` | JetBrains Mono | `0.625rem` (10px) | 400 (Regular) | `0.05em` | 1.2 | Technical labels, uppercase UI micro-text. Aggressively small to create a "technical spec" contrast against large display text. |

### Additional Letter Spacing Tokens

| Name | Value | Usage |
|------|-------|-------|
| `tightest` | `-0.04em` | — |
| `tighter` | `-0.02em` | Hero headings |
| `tight` | `-0.01em` | Section headings |
| `normal` | `0em` | Body text |
| `widest` | `0.05em` | Button text, navigation labels, section step titles |

### Typography Rules

- All UI control text (buttons, labels, navigation, prices, step titles) uses **JetBrains Mono**, **uppercase**, scaled to **10px** with `tracking-widest`. Making monospaced text aggressively small creates a beautiful "technical spec" feel that contrasts with massive hero text.
- Product titles on cards and the PDP use **Web Serveroff** (`font-serif`), **bold**.
- Body text and descriptions use **Inter** at 16px with **1.5** line height — tighter than typical, creating solid architectural text blocks while maintaining Cyrillic legibility.
- Prices always render in **JetBrains Mono** at `text-sm` or `text-lg` depending on context.
- The 404 page uses `font-mono text-6xl` for the number.

---

## 4. Layout & Grid System

### Global Layout

- The app uses a **12-column implicit grid** at the conceptual level, implemented via Tailwind's responsive grid utilities.
- Maximum content width is unconstrained on most pages (full-bleed), except the checkout flow which is capped at `max-width: 600px` and centered.
- Horizontal page padding: `px-6` on mobile, `px-12` on desktop — enforcing wide, editorial negative space.

### Responsive Breakpoints

| Breakpoint | Tailwind Prefix | Grid Columns (Product Feed) |
|------------|-----------------|----------------------------|
| Mobile | Default | 1 column (`grid-cols-1`) |
| Tablet | `md:` (768px) | 2 columns (`md:grid-cols-2`) |
| Desktop | `lg:` (1024px) | 4 columns (`lg:grid-cols-4`) |

### Page-Specific Layouts

#### Home Page
- **Hero Section**: Full viewport height (`h-screen`), full width. Background images swap by breakpoint — `pc hero.png` on `md:` and above, `phone.png` on mobile. White AFRICA logo centered (CSS filter: `brightness-0 invert`), sized `60vw` mobile / `50vw` desktop.
- **Product Feed**: 12-column grid with no gap (`gap-0`). Each cell has `border-b border-r border-black` creating a visible grid structure. Internal padding `p-6` per card to let products float inside geometry.

#### Product Detail Page (PDP)
- Two-column layout on desktop: **Image Gallery** spans 8/12 columns (`col-span-8`), **Command Center** spans 4/12 columns (`col-span-4`).
- On mobile: stacks vertically (single column).
- Command Center uses `position: sticky; top: 2rem` so purchase controls follow the user as they scroll the gallery.

#### Checkout Flow
- Single column, `max-width: 600px`, centered with `mx-auto`.
- Three sequential steps separated by full-width `border-b border-black` horizontal rules.
- Step numbering: "1. Контакти", "2. Доставка", "3. Оплата" — `font-mono text-[10px] uppercase tracking-widest`.

#### Error & 404 Pages
- Vertically and horizontally centered (`flex h-screen items-center justify-center`).
- Centered text block with heading, description, and action button.

---

## 5. Component Specifications

### 5.1 Header (Navigation Bar)

| Property | Value |
|----------|-------|
| Position | `sticky top-0 z-50` |
| Height | `h-16` (64px) |
| Background | `bg-white` |
| Border | `border-b border-black` (1px solid black bottom) |
| Padding | `px-6` mobile, `px-12` desktop |
| Layout | `flex justify-between items-center` |

**Left:** AFRICA logo image (`h-8 w-auto`), linked to home.
**Right:** Cart button — "Кошик" text in `font-mono text-[10px] uppercase tracking-widest`. Shows count in parentheses when cart has items, e.g., "Кошик (3)".

---

### 5.2 Hero Section

| Property | Value |
|----------|-------|
| Height | `h-screen` (100vh) |
| Width | Full width |
| Desktop Image | `/images/pc hero.png` — `object-cover`, hidden below `md:` |
| Mobile Image | `/images/phone.png` — `object-cover`, hidden at `md:` and above |
| Logo | `/images/new logo.PNG` — centered absolutely (`inset-0 flex items-center justify-center`), white via CSS filter (`brightness-0 invert`), `60vw` wide on mobile, `50vw` on desktop |

Both background images and the logo use `priority` loading for instant render.

---

### 5.3 Product Card

| Property | Value |
|----------|-------|
| Container | `block p-6`, no border/background on the card itself (borders come from the grid wrapper) |
| Hover state | `bg-surface-muted` (`#F5F5F0`) — `transition-colors duration-75 ease-out` (tactile snap, not instant) |
| Image aspect ratio | `aspect-square` (1:1) |
| Image background | `bg-surface-muted` placeholder |
| Image blend mode | `mix-blend-multiply` (product photos blend with the warm muted background) |
| Metadata layout | `flex justify-between items-start` — title left, price right |
| Title | `text-base font-serif font-bold` (Web Serveroff) |
| Price | `text-sm font-mono` (JetBrains Mono) |
| Empty state | "Немає фото" in `font-mono text-xs text-black/30` |

#### Desktop Image Behavior (Hover Carousel)
- The image container is divided into equal horizontal segments (one per image).
- Moving the mouse horizontally across the image selects the corresponding image.
- Images swap via `opacity-0` / `opacity-100` with `transition-opacity duration-200 ease-in-out`.
- Remaining images beyond the first are **lazy-loaded** — only rendered after the user's first `mouseenter` event (performance optimization).
- Segment indicators: horizontal bars at bottom-left, `h-[2px]`, `bg-black` for active / `bg-black/20` for inactive. Instant swap (`duration-0`).

#### Mobile Image Behavior (Snap Carousel)
- Horizontal scroll with `overflow-x-auto snap-x snap-mandatory`.
- Scrollbar hidden: `scrollbar-width: none` and `::-webkit-scrollbar: hidden`.
- First 2 images load eagerly, remainder use `loading="lazy"`.
- Dot indicators: centered bottom, `w-1.5 h-1.5` squares (no border-radius), `bg-black` active / `bg-black/25` inactive.

---

### 5.4 Product Detail — Image Gallery

| Property | Value |
|----------|-------|
| Aspect ratio | `3:4` (`aspect-[3/4]`) |
| Background | `bg-surface-muted` |
| Navigation | Arrow buttons (`←` / `→`), positioned vertically centered at left/right edges |
| Arrow buttons | `w-10 h-10`, `bg-white border border-black font-mono text-sm`. Hover: `bg-black text-white`. Disabled: `opacity-20 cursor-default`. |
| Counter badge | Bottom-right, `font-mono text-xs`, `bg-white border border-black px-2 py-1`, shows "N / M" |
| Carousel | Same snap-scroll mechanism as mobile product cards |
| Thumbnail strip | Below main image, `border-t border-black`. Each thumb: `w-20 h-20`, `border-r border-black`, `object-cover`. Active: `opacity-100`, inactive: `opacity-40`. Scrollbar hidden. |
| Empty state | "Немає зображень" in `font-mono text-sm text-black/30`, centered in 3:4 container |

---

### 5.5 Command Center (Product Controls)

| Property | Value |
|----------|-------|
| Position | `sticky top-8` (follows scroll on desktop) |
| Padding | `p-6` mobile, `lg:p-8` desktop |
| Title | `text-h2-section font-serif font-bold` |
| Price | `font-mono text-lg mt-2` |
| Sold out badge | `font-mono text-[10px] text-alert uppercase tracking-widest` — "РОЗПРОДАНО" |
| Attribute selectors | Stacked vertically with `gap-6`, rendered after `mt-8` |
| Add to cart button | Full width (`w-full`), `mt-8`, uses PrecisionButton |
| Accordions | `mt-8`, three sections: "Опис" (default open), "Склад", "Доставка" |

**Button States (Ukrainian text):**
| State | Text | Visual |
|-------|------|--------|
| No variant selected | "Оберіть варіант" | Disabled |
| Selected but out of stock | "Немає в наявності" | Disabled |
| All variants out of stock | "Розпродано" | Disabled |
| Ready | "Додати в кошик" | Active |

---

### 5.6 Precision Button (Primary CTA)

| Property | Default State | Hover State | Disabled/Loading State |
|----------|---------------|-------------|----------------------|
| Background | `bg-black` | `bg-white` | `bg-black` |
| Text color | `text-white` | `text-black` | `text-white` |
| Border | `border border-black` | `border border-black` + `ring-1 ring-inset ring-black` | `border border-black` |
| Opacity | 1.0 | 1.0 | `opacity-30` |
| Cursor | `pointer` | `pointer` | `not-allowed` |
| Text decoration | None | None | `line-through` |
| Typography | `font-mono uppercase tracking-widest text-[10px]` | Same | Same |
| Padding | `py-4 px-8` | Same | Same |
| Transition | `duration-75 ease-out` (tactile camera-shutter snap) | — | Hover locked to disabled colors |
| Loading text | — | — | `"..."` replaces children |

**Design note:** The hover state introduces an inner ring (`ring-inset`), creating a physical, framed "pressed" state rather than a simple color inversion. The 75ms transition registers as a premium interaction — mechanical objects still obey physics; a camera shutter is fast, but it isn't 0ms.

---

### 5.7 Form Input

| Property | Default State | Focus State | Error State |
|----------|---------------|-------------|-------------|
| Background | `bg-transparent` | Same | Same |
| Border | `border-b border-black` (bottom only, 1px) | `border-b border-black` (stays 1px — razor-thin consistency) | `border-alert` (`#FF0000`) |
| Outline | `outline-none` | `outline-none` | `outline-none` |
| Label | `font-mono text-[10px] tracking-widest uppercase` — above input | Same | Same |
| Error message | — | — | `font-mono text-xs text-alert` below input |
| Placeholder | `text-black/40` | `text-black` (turns solid to indicate focus) | Same as default |
| Width | `w-full` | Same | Same |
| Padding | `py-3` | Same | Same |
| Transition | — | `duration-75 ease-out` on placeholder color | — |

**Design note:** Focus is indicated by the placeholder text snapping to solid black rather than thickening the border. This maintains razor-thin 1px consistency everywhere.

---

### 5.8 Size / Attribute Selector

| Property | Value |
|----------|-------|
| Layout | `grid grid-cols-4 gap-2` |
| Label | `font-mono text-[10px] uppercase tracking-widest` — above the grid |
| Each option | `py-3 text-center font-mono text-sm border` |

| State | Background | Text | Border | Other |
|-------|------------|------|--------|-------|
| Default | `bg-white` | `text-black` | `border-black` | `cursor-pointer` |
| Selected | `bg-black` | `text-white` | `border-black` | — |
| Unavailable | `bg-white` | `text-black` | `border-black` | `opacity-30`, `line-through`, `cursor-not-allowed` |

---

### 5.9 Accordion

| Property | Value |
|----------|-------|
| Separator | `border-b border-black` on the wrapper |
| Toggle button | Full width, `py-4`, `flex justify-between items-center` |
| Title | `font-mono text-[10px] uppercase tracking-widest` |
| Icon | `font-mono text-lg` — `"+"` when closed, `"−"` when open |
| Content | `pb-4 text-sm leading-relaxed` |
| Default state | Configurable via `defaultOpen` prop |

---

### 5.10 Cart Drawer

| Property | Value |
|----------|-------|
| Position | `fixed right-0 top-0 z-50 h-full` |
| Width | `w-full max-w-md` (max 448px) |
| Background | `bg-white` |
| Border | `border-l border-black` |
| Layout | Flex column: header → scrollable items → footer |

**Header:** `border-b border-black p-6`. Title "Кошик" in `font-mono text-[10px] uppercase tracking-widest`. Close button "X" in `font-mono text-lg`.

**Empty state:** "Кошик порожній" in `font-mono text-sm text-black/50`.

**Footer (when items exist):** `border-t border-black p-6`. "Разом" label left (`font-mono text-[10px] uppercase tracking-widest`), total price right (`font-mono text-lg`). Full-width PrecisionButton: "Оформити замовлення".

**Overlay:** `bg-[#0A0A0A]/90` — no blur, no transparency. A stark, intentional curtain that feels raw and deliberate rather than "modern SaaS".

#### Cart Item Row

| Element | Style |
|---------|-------|
| Thumbnail | `h-24 w-20`, `object-cover` |
| Title | `text-sm font-medium` |
| Variant label | `font-mono text-xs text-black/60` |
| Quantity control | Inline `border border-black` wrapper, `−` and `+` buttons with `px-3 py-1 font-mono text-sm`, quantity in `font-mono text-sm` between them |
| Line total | `font-mono text-sm` |
| Remove button | "X" in `font-mono text-xs text-black/40 hover:text-black` |

---

### 5.11 Checkout Steps

**Step Contacts (1. Контакти):**
- `py-8` vertical spacing
- Name fields in `grid grid-cols-2 gap-4` (side by side)
- Email and phone fields full width, stacked with `gap-4`

**Step Shipping (2. Доставка):**
- Same `py-8` spacing
- All fields full width, stacked with `gap-4`
- Country field defaults to "Ukraine"

**Step Payment (3. Оплата):**
- Order summary listing each item
- Total row: `border-t border-black py-6`, label left (`text-[10px]`), price right (`text-lg`)
- Payment note: `text-sm text-black/60` — "Оплата при отриманні (накладений платіж)"
- Full-width PrecisionButton: "Оформити замовлення"

**Checkout Success:**
- Centered layout, displays thank-you message and order ID
- Home button using PrecisionButton

**Empty Cart State:**
- "Кошик порожній" in `font-mono text-sm`, centered
- "Повернутися до магазину" underlined link below

---

## 6. Motion & Animation

Motion follows the **"Precision Engineered"** principle. Zero-duration transitions feel like rendering errors; elegant brutalism requires ultra-fast, physical snaps. Mechanical objects still obey physics — a camera shutter is fast, but it isn't 0ms.

### Animation Specifications

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| **Page transition** | `clip-path: inset()` reveal (bottom to top) | 600ms | `cubic-bezier(0.77, 0, 0.175, 1)` — aggressive ease-in-out |
| **Cart drawer slide** | `translateX(100%)` → `translateX(0)` | 200ms | `cubic-bezier(0.16, 1, 0.3, 1)` — snappy ease-out |
| **Cart overlay fade** | `opacity: 0` → `opacity: 1` | 200ms | `ease-out` |
| **Product card image swap** | Opacity crossfade between stacked images | 200ms | `ease-in-out` |
| **Button hover** | Color inversion + inner ring border | 75ms | `ease-out` (tactile camera-shutter click) |
| **Product card hover bg** | Background color change | 75ms | `ease-out` |
| **Form focus** | Placeholder text color shift (transparent → solid) | 75ms | `ease-out` |
| **Carousel indicators** | Active/inactive color change | 0ms | Instant (`duration-0`) |

### Framer Motion Configuration

```typescript
// Page transitions
transition={{
  duration: 0.6,
  ease: [0.77, 0, 0.175, 1],
}}

// Cart drawer
transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}

// Cart overlay
transition={{ duration: 0.2, ease: "easeOut" }}
```

### Rules

- **Never** use `type: "spring"` with low stiffness/high bounce. If spring is used, parameters must be: `stiffness: 300, damping: 30` (critically damped — snaps without oscillation).
- All interactive transitions use **75ms with ease-out** — fast enough to feel mechanical, slow enough that the brain registers it as premium rather than a dropped frame.
- The only exceptions are carousel indicators, which remain instant (`duration-0`).

---

## 7. Imagery & Media

### Product Images

- Served from AWS S3: `africa-shop-dev.s3.eu-north-1.amazonaws.com/products/**`
- All images use Next.js `<Image>` component for automatic optimization (WebP conversion, responsive srcsets).
- Product card images: `aspect-square` (1:1) with `object-cover` and `mix-blend-multiply` (blends with `#F5F5F0` warm background).
- PDP gallery images: `aspect-[3/4]` (3:4) with `object-cover`.
- Thumbnails: `w-20 h-20` (80x80px) with `object-cover`.

### Loading Strategy

| Context | Strategy |
|---------|----------|
| Hero images & logo | `priority` (preloaded) |
| First product card image | `priority` on first render |
| Additional card images (desktop) | Deferred — only loaded on first `mouseenter` |
| Mobile card carousel | First 2 images `eager`, rest `lazy` |
| PDP gallery | First image `priority`, second `eager`, rest `lazy` |

### Image `sizes` Hints

| Context | sizes |
|---------|-------|
| Product card (desktop) | `(max-width: 1024px) 50vw, 25vw` |
| Product card (mobile) | `(max-width: 768px) 100vw, 50vw` |
| PDP gallery | `(max-width: 1024px) 100vw, 66vw` |
| Thumbnails | `80px` |

---

## 8. Iconography

The application uses **no icon library**. All icons are plain text characters rendered in JetBrains Mono:

| Purpose | Character | Font/Style |
|---------|-----------|------------|
| Cart close | `X` | `font-mono text-lg` |
| Remove item | `X` | `font-mono text-xs` |
| Accordion open | `+` | `font-mono text-lg` |
| Accordion close | `−` (minus sign) | `font-mono text-lg` |
| Quantity decrease | `−` (minus sign) | `font-mono text-sm` |
| Quantity increase | `+` | `font-mono text-sm` |
| Gallery prev | `←` | `font-mono text-sm` |
| Gallery next | `→` | `font-mono text-sm` |

---

## 9. Spacing & Sizing Reference

### Common Spacing Values

| Token | Value | Usage |
|-------|-------|-------|
| `p-6` | 24px | Product card internal padding, cart drawer sections, command center mobile padding |
| `p-8` / `lg:p-8` | 32px | Command center desktop padding |
| `px-6` | 24px | Mobile page horizontal padding |
| `px-12` | 48px | Desktop page horizontal padding |
| `py-4` | 16px vertical | Button padding, accordion toggle padding |
| `py-8` | 32px vertical | Checkout step sections |
| `px-8` | 32px horizontal | Button padding |
| `gap-1` | 4px | Carousel indicators |
| `gap-2` | 8px | Size selector grid, dots spacing |
| `gap-4` | 16px | Form field groups, grid columns |
| `gap-6` | 24px | Cart item list, attribute selector stack |
| `mt-2` | 8px | Price below title, sold out below price |
| `mt-4` | 16px | Within error/empty states |
| `mt-8` | 32px | Major section breaks (attributes, button, accordions) |
| `mb-4` | 16px | Image below card, headings |
| `mb-6` | 24px | Step title to content |
| `mb-8` | 32px | Error text to CTA |

### Fixed Sizes

| Element | Size |
|---------|------|
| Header height | `h-16` (64px) |
| Header logo | `h-8 w-auto` (32px height) |
| Cart drawer | `max-w-md` (448px) |
| Checkout form | `max-w-[600px]` |
| Gallery arrows | `w-10 h-10` (40px) |
| Thumbnails | `w-20 h-20` (80px) |
| Cart item thumbnail | `h-24 w-20` (96x80px) |
| Carousel indicator bars | `h-[2px]` |
| Carousel dots | `w-1.5 h-1.5` (6x6px) |

---

## 10. State Patterns

### Skeleton / Loading States

Product feed loading renders a pulsing grid of placeholder blocks:
- Same responsive grid as the product feed (1/2/4 columns)
- 8 placeholder items
- Each contains an `aspect-square bg-surface-muted animate-pulse` block + two text-line placeholders (`h-4 bg-surface-muted`)
- Padding matches product cards (`p-6`)

### Error States

- **Page-level error:** Centered "Помилка" heading + "Щось пішло не так" + retry PrecisionButton
- **Checkout stock error:** `border border-alert p-4` container above form with `font-mono text-sm text-alert` message
- **Form validation:** Inline `font-mono text-xs text-alert` below each invalid field + `border-alert` on the input

### Empty States

- **No products:** "Товарів не знайдено" in `font-mono text-sm text-black/50`, centered
- **No images:** "Немає фото" / "Немає зображень" in `font-mono text-xs text-black/30`, centered in placeholder
- **Empty cart drawer:** "Кошик порожній" in `font-mono text-sm text-black/50`
- **Empty cart at checkout:** "Кошик порожній" + "Повернутися до магазину" underline link

### Disabled States

Universal pattern: `opacity-30 cursor-not-allowed`. Text may also use `line-through` (buttons, size selectors).

---

## 11. Currency & Localization

| Aspect | Implementation |
|--------|----------------|
| Currency | UAH (Ukrainian Hryvnia) |
| Price format | `{amount} UAH` — e.g., "29.99 UAH". Two decimal places always shown. |
| All UI text | Ukrainian language |
| HTML lang | `uk` |
| Font subsets | Both Inter and JetBrains Mono include `cyrillic` + `latin` subsets |

---

## 12. Accessibility Notes

- All images have descriptive `alt` text in Ukrainian.
- Interactive elements use semantic HTML (`<button>`, `<a>`, `<input>`) — no `div`-based buttons.
- Form inputs have associated `<label>` elements.
- Disabled buttons use `disabled` attribute (not just visual styling).
- Cart drawer overlay is clickable to dismiss (escape hatch).
- Font display strategy: `swap` on all fonts to prevent FOIT (Flash of Invisible Text).
- Off-black text (`#0A0A0A`) improves readability on high-nit displays compared to pure black.

---

## 13. File & Asset Reference

### Static Assets (`/public/`)

| Path | Description |
|------|-------------|
| `/images/new logo.PNG` | Primary AFRICA logo — geometric/polygonal Africa continent outline with "AFRICA" text below (black on transparent) |
| `/images/pc hero.png` | Desktop hero background image |
| `/images/phone.png` | Mobile hero background image |
| `/fonts/Web Serveroff.ttf` | Custom serif display font (local) |

### Design Tokens Source

All design tokens are defined in `tailwind.config.ts` — this is the single source of truth for colors, typography utilities, spacing, and font families.

---

## Appendix A: v1.0 → v1.1 Changelog

| Area | v1.0 | v1.1 | Rationale |
|------|------|------|-----------|
| **Ink Primary** | `#000000` | `#0A0A0A` | Eliminates halation (visual buzzing) on OLED/Retina. Pure black reserved for borders only. |
| **Surface Muted** | `#F4F4F4` (neutral gray) | `#F5F5F0` (warm gallery tone) | Avoids "dead" digital gray; gives empty spaces a gallery-wall quality. |
| **Cart Overlay** | `bg-black/40 backdrop-blur-sm` | `bg-[#0A0A0A]/90` (no blur) | Stark, raw overlay feels more intentionally brutalist than soft SaaS blur. |
| **Body Prose LH** | 1.6 | 1.5 | Tighter line height creates architectural text blocks befitting brutalist aesthetic. |
| **Tech/Data size** | 12px | 10px | Aggressively small monospaced text creates editorial tension against large display text. |
| **H1 Hero max** | 5rem | 6rem | Larger max for more dramatic editorial impact. |
| **Button hover** | `duration-0` (instant) | `duration-75 ease-out` | 0ms feels like a glitch; 75ms reads as a premium tactile snap. |
| **Button hover ring** | None | `ring-1 ring-inset ring-black` | Inner ring creates a physical "pressed" frame effect. |
| **Form focus** | `border-b-2` (thicker) | Placeholder turns solid black, border stays 1px | Maintains razor-thin 1px consistency everywhere. |
| **Card padding** | `p-4` (16px) | `p-6` (24px) | Generous negative space lets products float inside geometric cage. |
| **Page padding** | `px-4` / `px-8` | `px-6` / `px-12` | Wider editorial margins. |
| **UI label size** | `text-xs` / `text-sm` | `text-[10px]` | Consistent 10px across all technical labels. |

---

## Appendix B: Quick Visual Audit Checklist

- [ ] No `border-radius` visible on any element
- [ ] No `box-shadow` visible on any element
- [ ] No gradients anywhere
- [ ] All borders are exactly 1px solid `#000000`
- [ ] Body text renders in `#0A0A0A` (off-black), not pure black
- [ ] Buttons snap on hover with inner ring (75ms, not instant)
- [ ] All UI control text is JetBrains Mono, uppercase, 10px
- [ ] Product titles use Web Serveroff (serif)
- [ ] Prices always in JetBrains Mono
- [ ] Red (`#FF0000`) only appears on errors and sold-out states
- [ ] Cart drawer slides from right, overlay is dark with no blur
- [ ] Page transitions use clip-path reveal
- [ ] All text renders crisply (check font smoothing)
- [ ] Hero images swap correctly at `md:` breakpoint
- [ ] Product grid shows 1/2/4 columns at respective breakpoints
- [ ] Cards have generous internal padding (`p-6`)
- [ ] Form inputs stay at 1px border on focus (no thickening)
