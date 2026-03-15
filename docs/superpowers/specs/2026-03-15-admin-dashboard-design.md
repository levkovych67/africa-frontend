# Admin Dashboard — Design Specification

## Purpose

Build a functional admin dashboard for Africa Shop that enables store operators to view sales analytics, manage products (CRUD with S3 image uploads), and manage orders (status updates, search, filtering). The admin panel lives under `/admin/*` routes within the existing Next.js app.

## Architecture

### Routing

Admin pages live under `src/app/admin/` with a dedicated layout separate from the storefront:

- `/admin/login` — authentication (no admin layout)
- `/admin` — dashboard stats (default admin page)
- `/admin/products` — product list
- `/admin/products/new` — create product
- `/admin/products/[id]/edit` — edit product
- `/admin/orders` — order list

### Authentication

- **Login:** POST `/api/v1/auth/login` returns `{ accessToken, refreshToken }`
- **Token storage:** Zustand auth store (`src/store/auth.ts`) with `persist` middleware using `sessionStorage`. This preserves auth across page refreshes within the same browser tab while clearing on tab close for security
- **Auto-refresh:** On 401 response, the admin API client attempts POST `/api/v1/auth/refresh` with the stored refresh token. If refresh fails, redirect to `/admin/login`
- **403 handling:** On 403 (Forbidden), do NOT attempt token refresh. Show "Недостатньо прав" (Insufficient permissions) error and redirect to `/admin`
- **Route protection:** An `AdminGuard` component wraps the admin layout. It checks for a valid access token on mount and redirects to `/admin/login` if absent
- **Token lifecycle:** Access token expires in 15 minutes; refresh token lasts 7 days

### API Client Extension

Create a new `src/lib/api/admin-client.ts` that wraps the existing `apiClient` from `client.ts` with an `adminClient<T>` function that:
1. Reads the access token from the auth store
2. Injects `Authorization: Bearer <token>` header
3. On 401: attempts token refresh, retries the original request once
4. On refresh failure: clears auth store, redirects to login

### Shared Code

Reuses from the storefront:
- `src/types/product.ts`, `src/types/order.ts`, `src/types/api.ts` — all type definitions (update `OrderResponse.status` from `string` to `"PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED"` union type)
- `src/lib/api/client.ts` — base fetch wrapper (extended, not duplicated)
- `src/lib/providers.tsx` — React Query provider (shared across both layouts)
- `src/lib/fonts.ts` — font definitions
- `src/lib/utils/price.ts` — price formatting

## Design System

### Conventional Admin Look

The admin uses a **conventional dashboard design**, visually distinct from the storefront's Brutalist aesthetic.

### Admin-Specific Tokens (added to globals.css @theme)

```
--color-admin-bg: #F8F9FA         — page background
--color-admin-surface: #FFFFFF    — cards, panels, modals
--color-admin-border: #E2E8F0     — subtle borders
--color-admin-sidebar: #1A1A2E    — sidebar background
--color-admin-sidebar-text: #E2E8F0 — sidebar text/icons
--color-admin-accent: #3B82F6     — links, primary actions, active nav
--color-admin-success: #22C55E    — success states
--color-admin-warning: #F59E0B    — warning states
--color-admin-danger: #EF4444     — danger/destructive states
```

### Border-Radius Scoping

The storefront enforces `border-radius: 0 !important` globally. The admin layout uses a `data-admin` attribute on its root element and overrides:

```css
[data-admin] *,
[data-admin] *::before,
[data-admin] *::after {
  border-radius: unset !important;
}
```

This removes the forced `0` from the storefront reset. Admin components then apply specific border-radius values using Tailwind utilities (`rounded-lg`, `rounded-md`, etc.) as needed. The `unset` keyword reverts the property to its natural initial value, allowing per-component control.

### Layout Structure

- **Sidebar** (fixed, 240px wide): dark background (`admin-sidebar`), logo at top, navigation links with text labels, user email + logout at bottom
- **Main content area**: light gray background (`admin-bg`), padded content with white card panels (`admin-surface`)
- **Responsive**: On mobile (<768px), sidebar collapses to a hamburger menu overlay

### Typography

- Headers: Inter semibold
- Body/data: Inter regular, 14px
- Monospace data (IDs, SKUs, prices): JetBrains Mono, 13px
- Same font files as storefront (already loaded with Cyrillic subsets)

## Pages

### 1. Login (`/admin/login`)

- Centered card on neutral background
- Fields: email, password (using admin-styled inputs, not storefront FormInput)
- Submit button: `bg-admin-accent text-white`, 8px border-radius
- Error display: inline message below form on 401
- On success: store tokens in auth store, redirect to `/admin`

### 2. Dashboard (`/admin`)

**Stat Cards (top row, 3 cards):**
- Total Revenue (formatted as UAH)
- Total Orders (count)
- Total Units Sold (count)
- Each card: white background, subtle border, large number with label below

**Date Range Filter:**
- Two date inputs (from/to) with sensible defaults (last 30 days)
- Refetches stats on change

**Revenue Chart:**
- Recharts `LineChart` showing `revenueByDay` data
- X-axis: dates, Y-axis: revenue in UAH
- Responsive width, 300px height
- Tooltip showing date + revenue + order count

**Top Products Chart:**
- Recharts `BarChart` showing `topProducts`
- Horizontal bars, product title on Y-axis, units sold on X-axis
- Uses `admin-accent` color for bars

### 3. Product List (`/admin/products`)

**Table columns:**
- Title (text, clickable → edit page)
- Status (badge: green=ACTIVE, yellow=DRAFT, gray=ARCHIVED)
- Base Price (JetBrains Mono, formatted)
- Variants (count)
- Created (date, formatted)
- Actions (archive button)

**Features:**
- Pagination controls (prev/next, page indicator)
- "Створити товар" (Create Product) button → `/admin/products/new`
- Sort by created date (default: newest first)

### 4. Product Form (`/admin/products/new` and `/admin/products/[id]/edit`)

**Sections:**

**Basic Info:**
- Title (text input, required)
- Description (textarea)
- Base Price (number input, required)

**Images:**
- Drag-and-drop zone with dashed border
- On drop/select: request presigned URL from API, upload to S3, show preview thumbnail
- Thumbnails are reorderable (drag to reorder)
- Each thumbnail has a delete button (removes from list, does not delete from S3)
- Accepts: image/jpeg, image/png, image/webp

**Attributes:**
- Dynamic list of attribute groups (e.g., "Size" with values ["S", "M", "L", "XL"])
- "Add Attribute" button adds a new group with type input + comma-separated values input
- Remove button per attribute group

**Variants:**
- Table generated from attribute combinations
- Columns: attribute values (read-only), SKU (text input), Price Modifier (number input), Stock (number input)
- Auto-generates SKU suggestions from attribute values

**Actions:**
- "Зберегти як чернетку" (Save as Draft) — on create: POST to create (API defaults to DRAFT). On edit: PUT update without status change
- "Опублікувати" (Publish) — on create: POST to create, then immediately PUT to set `{ status: "ACTIVE" }` (two-step, since the API creates as DRAFT). On edit: PUT update with `{ status: "ACTIVE" }` in the payload
- Cancel → back to product list

**Note:** The create endpoint always returns DRAFT status. Publishing a new product requires a follow-up PUT to update status to ACTIVE. The update endpoint accepts partial payloads including `status`.

### 5. Orders (`/admin/orders`)

**Table columns:**
- Order ID (JetBrains Mono, truncated)
- Customer (firstName + lastName)
- Email
- Total (JetBrains Mono, formatted as UAH)
- Status (badge with color)
- Date (formatted)

**Features:**
- Status filter dropdown (All, PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- Search by email
- Pagination
- Row click → expand/modal showing:
  - Full customer info (name, email, phone)
  - Order items (product title, variant, quantity, unit price)
  - Shipping details (address, city, postal code, country)
  - Tracking number + carrier (display-only — no API endpoint exists for setting these)
- Status update: dropdown/buttons to change order status with confirmation

**Status badge colors:**
- PENDING: yellow
- CONFIRMED: blue
- SHIPPED: purple
- DELIVERED: green
- CANCELLED: red

## File Structure

```
src/
  app/
    admin/
      layout.tsx              — Admin layout (sidebar + main area + AdminGuard)
      page.tsx                — Dashboard stats
      login/
        page.tsx              — Login form
      products/
        page.tsx              — Product list
        new/
          page.tsx            — Create product
        [id]/
          edit/
            page.tsx          — Edit product
      orders/
        page.tsx              — Order list
  components/
    admin/
      layout/
        admin-sidebar.tsx     — Sidebar navigation
        admin-guard.tsx       — Auth route protection
      dashboard/
        stat-card.tsx         — Single stat card
        revenue-chart.tsx     — Line chart
        top-products-chart.tsx — Bar chart
        date-range-picker.tsx — From/to date filter
      products/
        product-table.tsx     — Product list table
        product-form.tsx      — Create/edit form orchestrator
        image-uploader.tsx    — Drag-and-drop S3 upload
        attribute-editor.tsx  — Dynamic attribute management
        variant-table.tsx     — Variant grid editor
      orders/
        order-table.tsx       — Order list table
        order-detail.tsx      — Order detail modal/panel
        status-badge.tsx      — Colored status pill
        status-updater.tsx    — Status change controls
      ui/
        admin-button.tsx      — Admin-styled button (rounded, colored)
        admin-input.tsx       — Admin-styled form input
        admin-select.tsx      — Admin-styled select dropdown
        admin-table.tsx       — Reusable table with pagination
        admin-modal.tsx       — Modal dialog
        admin-toast.tsx       — Toast notification
  hooks/
    use-auth.ts               — Login, logout, token refresh hooks
    use-admin-products.ts     — Admin product CRUD hooks
    use-admin-orders.ts       — Admin order hooks
    use-dashboard-stats.ts    — Dashboard stats hook
    use-image-upload.ts       — S3 presign + upload hook
  store/
    auth.ts                   — Zustand: accessToken, refreshToken, user email, login/logout
  lib/
    api/
      admin-client.ts         — Admin fetch wrapper with auth header + 401 refresh
      admin-products.ts       — Admin product API functions
      admin-orders.ts         — Admin order API functions
      admin-dashboard.ts      — Dashboard stats API function
      admin-images.ts         — Presign URL API function
      admin-auth.ts            — Login + refresh API functions
  types/
    admin-auth.ts             — LoginPayload, AuthTokens, RefreshPayload
    dashboard.ts              — DashboardStats, TopProduct, RevenueByDay
```

## New Dependencies

- `recharts` — charting library for dashboard stats

## Error Handling

- **401 on any admin request:** Attempt token refresh. If refresh fails, clear auth store, redirect to `/admin/login` with a "Сесія закінчилась" (Session expired) message
- **403 on any admin request:** Do NOT refresh. Show "Недостатньо прав" toast, redirect to `/admin`
- **400 on product create/update:** Show field-level validation errors inline
- **404 on product/order:** Show "Не знайдено" message, link back to list
- **Network errors:** Toast notification with retry option

## Loading States

- **Dashboard:** Skeleton cards (3 gray rectangles) + skeleton chart area while stats load
- **Product/Order tables:** Skeleton rows (5 rows of gray bars) while data loads
- **Product form (edit mode):** Full form skeleton while product data loads
- **Image upload:** Progress indicator during S3 upload

## Testing Strategy

- Build verification: `npm run build` passes with zero type errors
- Manual verification checklist:
  1. Login with valid credentials → redirects to dashboard
  2. Login with invalid credentials → shows error
  3. Dashboard loads stats with charts rendering
  4. Date range filter refetches stats
  5. Create product with images (drag-and-drop upload to S3) → saves as draft
  6. Publish product (two-step: create then activate) → appears in storefront
  7. Edit product → changes persist
  8. Archive product → status changes, removed from storefront
  9. View orders → table renders with pagination
  10. Filter orders by status → table filters
  11. Update order status → badge changes
  12. Token refresh on 401 → retries request transparently
  13. Session expiry → redirects to login with message
  14. Page refresh → stays logged in (sessionStorage persistence)
