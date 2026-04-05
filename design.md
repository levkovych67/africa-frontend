# AFRICA SHOP — Design System Documentation

**Version:** 3.0 (Luminous Aura + iOS Physics)
**Last Updated:** March 2026
**Platform:** Web (Next.js 16 / Tailwind CSS 3 / Framer Motion 12)
**Language:** Ukrainian (uk)

---

## 1. Design Philosophy

The AFRICA SHOP visual identity combines **luminous minimalism** with **physics-based micro-interactions**. Generous whitespace, warm neutral tones, and a single vibrant accent color (Sunrise Coral) create an inviting, premium feel. Interactions borrow from native iOS — rubber-band scrolling, spring animations, and pull-to-dismiss mechanics give the store a tactile, app-like quality.

### Core Principles

| Principle            | Description                                                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Cloud Depth**      | Visual hierarchy through multi-layered soft shadows, not borders. Elements float on cushions of air.                          |
| **Organic Geometry** | Rounded corners everywhere — `rounded-2xl` (16px) for cards, `rounded-xl` (12px) for inputs, `rounded-full` for pill buttons. |
| **Luminous Warmth**  | Pearl off-white background (`#FDFCFB`) with pure white floating surfaces creates a gallery glow effect.                       |
| **Fluid Spring**     | All motion uses spring physics — fast, critically damped, zero bounce. Feels like high-end machinery.                         |
| **Vibrant Focus**    | Sunrise Coral (`#FF5A5F`) draws the eye to primary actions. Used sparingly for maximum impact.                                |

---

## 2. Color Palette

| Token         | Hex       | Tailwind                  | Usage                                                             |
| ------------- | --------- | ------------------------- | ----------------------------------------------------------------- |
| **Pearl**     | `#FDFCFB` | `bg-pearl`                | Global page background. Warm off-white.                           |
| **White**     | `#FFFFFF` | `bg-white`                | Floating card surfaces, input fields, overlays.                   |
| **Coral**     | `#FF5A5F` | `bg-coral` / `text-coral` | Primary CTA buttons, selected states, error borders, focus rings. |
| **Emerald**   | `#10B981` | `text-emerald`            | Success states (reserved, minimal use).                           |
| **Stone 900** | `#1C1917` | `text-stone-900`          | Primary text color. Near-black.                                   |
| **Stone 500** | `#78716C` | `text-stone-500`          | Secondary text, labels, placeholders.                             |
| **Stone 200** | `#E7E5E4` | `border-stone-200`        | Subtle borders, dividers.                                         |
| **Stone 100** | `#F5F5F4` | `bg-stone-100`            | Skeleton loading blocks, muted backgrounds.                       |
| **Stone 50**  | `#FAFAF9` | `bg-stone-50`             | Hover backgrounds on list items.                                  |

### Overlay Colors

| Context                  | Value                              | Description                             |
| ------------------------ | ---------------------------------- | --------------------------------------- |
| Product overlay backdrop | `bg-stone-900/30 backdrop-blur-md` | Two layers: blur + tint.                |
| Cart overlay backdrop    | `bg-stone-900/30 backdrop-blur-md` | Blurred background when cart opens.     |
| Footer                   | `bg-black/80 backdrop-blur-xl`     | Dark, heavily blurred footer over hero. |

### Color Rules

- No gradients.
- Coral is **only** for: CTA buttons, selected size options, focus rings, error states, sold-out badges.
- Prices render in `text-stone-900` (standard ink), **never** coral.
- Secondary text uses `text-stone-500`, tertiary uses `text-stone-400`.
- Opacity modifiers: `/30` for overlays, `/50` for subtle borders, `/20` for focus rings.

---

## 3. Typography

### Font Stack

| Font                  | Source       | CSS Variable           | Subsets             | Usage                                             |
| --------------------- | ------------ | ---------------------- | ------------------- | ------------------------------------------------- |
| **Inter**             | Google Fonts | `--font-inter`         | Cyrillic, Latin     | Body text, descriptions. Default sans-serif.      |
| **Plus Jakarta Sans** | Google Fonts | `--font-jakarta`       | Cyrillic-ext, Latin | Headings, labels, buttons, UI controls.           |
| **Space Grotesk**     | Google Fonts | `--font-space-grotesk` | Latin               | Prices, counters, numerical data. Technical feel. |

### Tailwind Font Classes

```
font-sans     → Inter
font-jakarta  → Plus Jakarta Sans
font-grotesk  → Space Grotesk
```

### Type Scale

| Style          | CSS Class          | Font         | Size                         | Weight | Tracking  | Line Height |
| -------------- | ------------------ | ------------ | ---------------------------- | ------ | --------- | ----------- |
| **H1 Hero**    | `.text-h1-hero`    | Jakarta Sans | `clamp(2.5rem, 8vw, 6rem)`   | 800    | `-0.02em` | 1.0         |
| **H2 Section** | `.text-h2-section` | Jakarta Sans | `clamp(1.5rem, 4vw, 2.5rem)` | 700    | `-0.01em` | 1.1         |
| **Body**       | `.text-body-prose` | Inter        | `1rem` (16px)                | 400    | `0em`     | 1.5         |
| **Label**      | `.text-label`      | Jakarta Sans | `0.75rem` (12px)             | 700    | `0.03em`  | —           |

### Typography Patterns

| Element                        | Classes                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------- |
| UI labels / buttons / headings | `font-jakarta font-bold text-xs uppercase tracking-wider`                       |
| Product titles (cards)         | `font-jakarta font-semibold text-base text-stone-900`                           |
| Product titles (detail)        | `text-h2-section font-jakarta font-bold`                                        |
| Prices                         | `font-grotesk text-sm text-stone-900` (cards) / `font-grotesk text-xl` (detail) |
| Artist names                   | `text-sm text-stone-500 hover:text-coral`                                       |
| Section headings (checkout)    | `font-jakarta font-bold text-xs uppercase tracking-wider`                       |
| Sold-out badge                 | `font-jakarta font-bold text-xs text-coral uppercase tracking-wider`            |
| Info section headings          | `font-jakarta font-bold text-xs uppercase tracking-wider mb-2`                  |
| Info section body              | `text-sm leading-relaxed`                                                       |

---

## 4. Shadows

| Token         | Value                             | Usage                                    |
| ------------- | --------------------------------- | ---------------------------------------- |
| `shadow-soft` | `0 8px 30px rgba(28,25,23,0.05)`  | Product cards at rest, skeleton loaders. |
| `shadow-lift` | `0 20px 40px rgba(28,25,23,0.08)` | Card hover state, elevated overlays.     |
| `shadow-glow` | `0 0 20px rgba(255,90,95,0.15)`   | Coral button hover glow.                 |

---

## 5. Border Radius

| Element                   | Radius | Tailwind       |
| ------------------------- | ------ | -------------- |
| Product cards             | 16px   | `rounded-2xl`  |
| Product overlay           | 24px   | `rounded-3xl`  |
| Input fields              | 12px   | `rounded-xl`   |
| Buttons (CTA)             | 9999px | `rounded-full` |
| Thumbnails                | 8px    | `rounded-lg`   |
| Cart item images          | 12px   | `rounded-xl`   |
| Carousel images (overlay) | 16px   | `rounded-2xl`  |

---

## 6. Layout & Grid

### Global

- Page background: `#FDFCFB` (pearl)
- Body text: `#1C1917` (stone-900)
- Font smoothing: `antialiased`, `optimizeLegibility`

### Responsive Breakpoints

| Breakpoint | Prefix         | Product Grid |
| ---------- | -------------- | ------------ |
| Mobile     | Default        | 1 column     |
| Tablet     | `md:` (768px)  | 2 columns    |
| Desktop    | `lg:` (1024px) | 4 columns    |

### Product Grid

```
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 px-6 md:px-8
```

No visible grid lines — cards float via shadows.

### Page Layouts

| Page           | Container                                      | Notes                                                     |
| -------------- | ---------------------------------------------- | --------------------------------------------------------- |
| Home           | Full width                                     | Hero (sticky z-0) + Product feed (relative z-10) + Footer |
| Product Detail | `bg-pearl py-8`                                | 12-col grid: gallery 8/12 + controls 4/12, gap-8          |
| Checkout       | `bg-pearl py-12`, `max-w-[600px] mx-auto px-6` | Single column centered                                    |
| Error / 404    | `flex h-screen items-center justify-center`    | Centered content                                          |

---

## 7. Component Specifications

### 7.1 Header

| Property    | Value                                                                   |
| ----------- | ----------------------------------------------------------------------- |
| Position    | `sticky top-0 z-50`                                                     |
| Height      | `h-16` (64px)                                                           |
| Background  | `bg-white/70 backdrop-blur-md` (frosted glass)                          |
| Border      | `border-b border-stone-200/30`                                          |
| Padding     | `px-6` mobile, `px-12` desktop                                          |
| Logo        | `/images/new-logo.webp`, `h-8 w-auto`                                   |
| Cart button | `font-jakarta font-bold text-xs uppercase tracking-wider`               |
| Cart pulse  | On item add: `scale [1, 1.2, 1]` + `opacity [1, 0.7, 1]`, 400ms easeOut |

### 7.2 Footer

| Property   | Value                                                              |
| ---------- | ------------------------------------------------------------------ |
| Background | `bg-black/80 backdrop-blur-xl`                                     |
| Text       | `text-white`, secondary `text-stone-400`, credits `text-stone-500` |
| Logo       | White version (`brightness-0 invert`), `h-10 w-auto`               |
| Bottom bar | `border-t border-stone-700 mt-10 pt-6`                             |
| Padding    | `py-12 px-6 md:px-12`, content `max-w-6xl mx-auto`                 |

### 7.3 Hero Section

| Property       | Value                                                                   |
| -------------- | ----------------------------------------------------------------------- |
| Position       | `sticky top-0 z-0 h-screen`                                             |
| Desktop image  | `/images/pc-hero.webp.png`, `object-cover`                              |
| Mobile image   | `/images/phone.webp`, `object-cover`, `loading="eager"`                 |
| Logo overlay   | Centered, `60vw` mobile / `50vw` desktop, `brightness-0 invert` (white) |
| Scroll blur    | `0px → 12px` over 0–500px scroll                                        |
| Scroll opacity | `1 → 0.4` over same range                                               |
| Scroll snap    | At 250px scroll, page auto-scrolls to product section (below navbar)    |

### 7.4 Product Card

| Property       | Value                                                                |
| -------------- | -------------------------------------------------------------------- |
| Container      | `rounded-2xl overflow-hidden shadow-soft`                            |
| Hover          | `hover:-translate-y-1 hover:shadow-lift transition-all duration-300` |
| Image aspect   | `4:5`                                                                |
| Text container | `bg-white rounded-b-2xl p-4`                                         |
| Title          | `font-jakarta font-semibold text-base text-stone-900`                |
| Price          | `font-grotesk text-sm text-stone-900`                                |
| Artist         | `text-sm text-stone-500 hover:text-coral`                            |

**Desktop hover carousel:**

- Segment-based mouse position → image swap via opacity (200ms ease-in-out)
- Lazy load: secondary images rendered after first `mouseenter`
- Indicators: `h-[2px]` bars, `bg-white` active / `bg-white/50` inactive

**Mobile snap carousel:**

- `snap-x snap-mandatory`, scrollbar hidden
- Dot indicators: `w-1.5 h-1.5`, `bg-white` / `bg-white/50`
- First 2 images eager, rest lazy

### 7.5 Product Overlay (iOS Pull-to-Dismiss Sheet)

**Entrance:**

- `y: "100vh" → 0` with spring: `damping: 30, stiffness: 300, mass: 0.8`
- Backdrop: blur + tint layers fade in 200ms

**Card:**

- Position: `fixed`, `top-20 bottom-4 left-4 right-4`
- Style: `bg-white rounded-3xl shadow-lift`
- Content: `overflow-y-auto overscroll-none`, scrollbar hidden

**Scroll-to-bottom bounce:**

- When scroll first hits bottom: card bounces up 12px (`stiffness: 600, damping: 15`) then settles back (`stiffness: 500, damping: 30`)

**Rubber-band dismiss:**

- Activates only after content is fully scrolled + 100ms settle period
- Pull resistance: `0.35` (100px scroll = 35px card movement)
- Ejection threshold: `120px` of resisted card movement
- **Below threshold (release):** snap back with `stiffness: 500, damping: 40`
- **Past threshold (eject):** card flies up off-screen, 250ms easeOut

**Backdrop exit:**

- Both blur and tint layers fade out over 500ms (easeOut) for smooth transition

**Close button ("ЗАКРИТИ"):**

- Appears after 100px of content scroll
- `font-jakarta text-[9px] text-stone-500 uppercase tracking-wider`
- `bg-stone-50/80 backdrop-blur-sm`
- Animates in: `opacity 0→1, height 0→auto`, 200ms

**Carousel inside overlay:**

- `aspect-[4/5] rounded-2xl bg-stone-100`
- Counter: `bg-white border border-stone-200 px-2 py-1 font-grotesk text-xs`

### 7.6 Command Center (Product Controls)

| Property    | Desktop                                                              | Overlay (compact)      |
| ----------- | -------------------------------------------------------------------- | ---------------------- |
| Position    | `sticky top-8 p-6 lg:p-8`                                            | No sticky, no padding  |
| Title       | `text-h2-section font-jakarta font-bold`                             | Same                   |
| Price       | `font-grotesk text-xl`                                               | Same                   |
| Sold out    | `font-jakarta font-bold text-xs text-coral uppercase tracking-wider` | Same                   |
| Add to cart | Opens cart drawer                                                    | Silent add (no drawer) |

**Info sections (replaces accordions):**

- Heading: `font-jakarta font-bold text-xs uppercase tracking-wider mb-2`
- Body: `text-sm leading-relaxed`
- Spacing: `space-y-6` between sections

### 7.7 Image Gallery (Product Detail Page)

**Mobile:**

- Frame: `border border-black p-2 bg-white` (brutalist "mat board" effect)
- Counter badge: `bg-white border border-black px-2 py-1 font-grotesk text-[10px] tracking-widest`
- No arrows, no thumbnails — swipe only

**Desktop:**

- Container: `rounded-xl overflow-hidden bg-stone-100`
- Arrows: `w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-soft`, hover: `bg-white shadow-lift`, disabled: `opacity-20`
- Counter: `rounded-full bg-white/80 backdrop-blur-sm px-3 py-1.5 shadow-soft font-grotesk text-xs`
- Thumbnails: `w-20 h-20 rounded-lg`, active `opacity-100` / inactive `opacity-40`, `gap-2 mt-3`

### 7.8 Cart (Blurred Overlay with Card List)

**Backdrop:** `bg-stone-900/30 backdrop-blur-md`, body scroll locked

**Layout:**

- `fixed inset-0 z-50`, padded `pt-24 pb-8 px-4 md:px-8`
- Content: `max-w-lg mx-auto`
- Entry: `opacity 0→1, y 30→0` with spring `stiffness: 300, damping: 30`

**Header:**

- Title: `font-jakarta font-bold text-xs uppercase tracking-wider text-white`
- Close: `w-8 h-8 rounded-full bg-white/20 hover:bg-white/30`

**Item cards:**

- `bg-white rounded-2xl shadow-soft p-4`
- Staggered entry: each card delays `index * 50ms`
- Image: `h-28 w-24 rounded-xl bg-stone-100`
- Title: `font-jakarta font-semibold text-sm text-stone-900 truncate`
- Variant: `font-grotesk text-xs text-stone-500`
- Quantity: `bg-stone-100 rounded-full`, buttons `w-8 h-8`
- Remove: `w-6 h-6 rounded-full bg-stone-100 hover:text-coral`

**Footer card:**

- `bg-white rounded-2xl shadow-soft p-5`
- Total: `font-jakarta` label + `font-grotesk text-xl` amount
- Full-width CTA button

### 7.9 Precision Button (Primary CTA)

| Property   | Value                                                     |
| ---------- | --------------------------------------------------------- |
| Shape      | `rounded-full py-3.5 px-8`                                |
| Typography | `font-jakarta font-bold text-xs uppercase tracking-wider` |
| Colors     | `bg-coral text-white`                                     |
| Hover      | `hover:scale-[1.02] hover:shadow-glow`                    |
| Disabled   | `opacity-40 cursor-not-allowed`                           |
| Loading    | `"..."` replaces children                                 |
| Transition | `transition-all duration-200 ease-out`                    |

### 7.10 Form Input

| Property    | Default                                                                  | Focus                               | Error                |
| ----------- | ------------------------------------------------------------------------ | ----------------------------------- | -------------------- |
| Container   | `bg-white border border-stone-200 rounded-xl`                            | `border-coral ring-2 ring-coral/20` | `border-coral`       |
| Padding     | `py-3 px-4`                                                              | Same                                | Same                 |
| Placeholder | `text-stone-400`                                                         | Same                                | Same                 |
| Label       | `font-jakarta font-bold text-xs uppercase tracking-wider text-stone-500` | —                                   | —                    |
| Error text  | —                                                                        | —                                   | `text-coral text-xs` |
| Transition  | `transition-all duration-200`                                            | —                                   | —                    |

### 7.11 Size Selector

| State       | Background | Text             | Border                                         |
| ----------- | ---------- | ---------------- | ---------------------------------------------- |
| Default     | `bg-white` | `text-stone-900` | `border-stone-200`                             |
| Hover       | Same       | Same             | `border-stone-400`                             |
| Selected    | `bg-coral` | `text-white`     | `border-coral`                                 |
| Unavailable | `bg-white` | `text-stone-900` | `border-stone-200` + `opacity-30 line-through` |

Layout: `grid grid-cols-4 gap-2`, buttons `rounded-xl py-3 font-jakarta text-sm`

---

## 8. Motion & Animation

### Spring Configurations

| Context                | Stiffness | Damping | Mass | Notes                     |
| ---------------------- | --------- | ------- | ---- | ------------------------- |
| Page entrance          | 250       | 25      | 0.5  | Subtle upward fade-in     |
| Overlay entrance       | 300       | 30      | 0.8  | iOS-weight sheet slide-up |
| Cart entrance          | 300       | 30      | —    | Items + footer fade-in    |
| Cart item stagger      | 300       | 30      | —    | 50ms delay per item       |
| Rubber-band snap-back  | 500       | 40      | —    | Fast, zero wobble         |
| Bottom bounce (enter)  | 600       | 15      | —    | Slightly bouncy           |
| Bottom bounce (settle) | 500       | 30      | —    | Clean settle              |

### Transition Specs

| Element             | Animation            | Duration      | Easing      |
| ------------------- | -------------------- | ------------- | ----------- |
| Card hover          | translate-y + shadow | 300ms         | CSS default |
| Image carousel swap | Opacity crossfade    | 200ms         | ease-in-out |
| Button hover        | Scale + glow         | 200ms         | ease-out    |
| Backdrop fade-in    | Opacity 0→1          | 200ms         | default     |
| Backdrop fade-out   | Opacity 1→0          | 500ms         | ease-out    |
| Header cart pulse   | Scale + opacity      | 400ms         | ease-out    |
| Overlay close text  | Height + opacity     | 200ms         | default     |
| Hero scroll blur    | Filter blur 0→12px   | Scroll-linked | —           |
| Hero scroll opacity | 1→0.4                | Scroll-linked | —           |

### Rubber-Band Physics

| Parameter            | Value                                     |
| -------------------- | ----------------------------------------- |
| Pull resistance      | `0.35` (100px input = 35px card movement) |
| Ejection threshold   | `120px` resisted distance                 |
| Settle delay (wheel) | `100ms` before unlock                     |
| Bottom bounce        | `12px` upward on first bottom hit         |
| Eject animation      | `y: -100vh`, 250ms, easeOut               |

---

## 9. Iconography

No icon library. All icons are text characters:

| Purpose             | Character | Style                                                                      |
| ------------------- | --------- | -------------------------------------------------------------------------- |
| Close (cart header) | `✕`       | `text-white` on `bg-white/20 rounded-full`                                 |
| Close (overlay)     | `закрити` | `text-[9px] text-stone-500 uppercase` on `bg-stone-50/80 backdrop-blur-sm` |
| Remove item         | `✕`       | `text-stone-400` on `bg-stone-100 rounded-full`                            |
| Quantity +/-        | `+` / `−` | `font-jakarta text-sm` in `bg-stone-100 rounded-full`                      |
| Gallery arrows      | `←` / `→` | `font-sans text-sm` in `rounded-full shadow-soft`                          |
| Accordion toggle    | `+` / `−` | `text-stone-500 text-lg`                                                   |

---

## 10. Spacing Reference

### Common Values

| Token    | Value | Usage                                   |
| -------- | ----- | --------------------------------------- |
| `p-4`    | 16px  | Card content padding, cart item padding |
| `p-6`    | 24px  | Overlay content, command center mobile  |
| `px-6`   | 24px  | Mobile page padding                     |
| `px-8`   | 32px  | Grid side padding                       |
| `px-12`  | 48px  | Desktop header/footer padding           |
| `py-3`   | 12px  | Input/button vertical padding           |
| `py-3.5` | 14px  | CTA button vertical padding             |
| `py-4`   | 16px  | Accordion trigger padding               |
| `py-8`   | 32px  | Checkout step sections                  |
| `py-12`  | 48px  | Footer vertical, checkout page          |
| `gap-2`  | 8px   | Size grid, thumbnail strip              |
| `gap-3`  | 12px  | Cart item list                          |
| `gap-4`  | 16px  | Form fields, grid gaps, info sections   |
| `gap-6`  | 24px  | Attribute selector sections             |
| `gap-8`  | 32px  | Desktop grid gaps                       |

### Fixed Sizes

| Element             | Size                                |
| ------------------- | ----------------------------------- |
| Header              | `h-16` (64px)                       |
| Header logo         | `h-8 w-auto`                        |
| Footer logo         | `h-10 w-auto`                       |
| Cart item image     | `h-28 w-24`                         |
| Gallery arrows      | `w-10 h-10`                         |
| Gallery thumbnails  | `w-20 h-20`                         |
| Cart close button   | `w-8 h-8`                           |
| Cart remove button  | `w-6 h-6`                           |
| Quantity buttons    | `w-8 h-8`                           |
| Carousel indicators | `h-[2px]` bars / `w-1.5 h-1.5` dots |

---

## 11. State Patterns

### Loading

- Product feed: `rounded-2xl shadow-soft` cards with `bg-stone-100 animate-pulse` blocks
- Overlay skeleton: aspect-[4/5] image + title/price/grid/button placeholders
- Warehouse loading: `text-xs text-stone-400` text

### Error

- Page-level: centered `font-jakarta text-2xl font-bold` + `text-stone-500` message + CTA
- Checkout stock error: `bg-coral/10 border border-coral/20 rounded-xl p-4` with `text-coral` message
- Form validation: `border-coral` on input + `text-coral text-xs` below

### Empty

- No products: `py-20 text-center text-sm text-stone-500`
- Empty cart: `bg-white rounded-2xl shadow-soft p-8 text-center` with `text-stone-400`
- Empty cart at checkout: `text-sm` + `text-coral hover:text-coral/80` link

### Disabled

- Buttons: `opacity-40 cursor-not-allowed`
- Size options: `opacity-30 line-through cursor-not-allowed`
- Gallery arrows: `opacity-20 cursor-default`

---

## 12. Currency & Localization

| Aspect       | Value                                                         |
| ------------ | ------------------------------------------------------------- |
| Currency     | UAH (Ukrainian Hryvnia)                                       |
| Format       | `{amount} UAH` — 2 decimal places                             |
| Language     | Ukrainian                                                     |
| HTML lang    | `uk`                                                          |
| Font subsets | Cyrillic + Latin (Inter, Jakarta Sans), Latin (Space Grotesk) |

---

## 13. Asset Reference

| Path                               | Description                                               |
| ---------------------------------- | --------------------------------------------------------- |
| `/images/new-logo.webp`            | AFRICA logo — geometric polygonal Africa continent + text |
| `/images/pc-hero.webp.png`         | Desktop hero background                                   |
| `/images/phone.webp`               | Mobile hero background                                    |
| `/images/leopard_pc_navbar.png`    | Leopard pattern (desktop, unused currently)               |
| `/images/leopard_phone_navbar.png` | Leopard pattern (mobile, unused currently)                |
| `/fonts/Web Serveroff.ttf`         | Legacy serif font (no longer used)                        |

---

## 14. Visual Audit Checklist

- [ ] All cards have `rounded-2xl` with `shadow-soft`
- [ ] No hard borders on cards — depth via shadows only
- [ ] Coral only on CTAs, selections, errors, sold-out
- [ ] Prices in `font-grotesk`, never coral
- [ ] Labels consistently `font-jakarta font-bold text-xs uppercase tracking-wider`
- [ ] Hero blurs on scroll (0→12px over 500px)
- [ ] Product overlay slides up with iOS spring
- [ ] Rubber-band dismiss activates only after content is fully scrolled
- [ ] Cart overlay blurs page, items enter with staggered animation
- [ ] Header cart button pulses on item add
- [ ] Scroll snap fires at 250px
- [ ] Bottom bounce (12px) when overlay scroll hits bottom
- [ ] Backdrop fades out slowly (500ms) when overlay closes
- [ ] Close text ("закрити") appears after 100px scroll
- [ ] Footer is dark with blur, showing through hero
- [ ] Mobile gallery has brutalist black frame
- [ ] Desktop gallery has frosted-glass arrows and thumbnails
- [ ] All forms use coral focus rings
- [ ] Empty/error states use stone-400/500 text
