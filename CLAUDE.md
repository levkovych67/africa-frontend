# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Africa Shop — a merch e-commerce storefront for the "Africa" brand (Ukrainian, locale `uk`). Next.js 16 frontend with a separate Spring Boot backend API (not in this repo). Features a public storefront with product catalog, cart, and checkout, plus a JWT-protected admin panel for managing products, orders, and artists.

## Commands

- `npm run dev` — start dev server (localhost:3000)
- `npm run build` — production build (standalone output)
- `npm run lint` — ESLint (flat config, next/core-web-vitals + typescript)
- No test framework is configured

## Environment

- `NEXT_PUBLIC_API_URL` — backend API base URL (default: `http://localhost:8080`)
- Backend API docs: see `api.md` in repo root

## Deployment

Self-hosted on VPS via GitHub Actions (push to `main` triggers deploy). Runs as a systemd service using Next.js standalone output (`.next/standalone/server.js`). Not deployed to Vercel.

## Architecture

### Stack
- **Next.js 16** App Router, all pages are client components (`"use client"`)
- **React 19**, **TypeScript**, **Tailwind CSS 3** with custom design tokens
- **Zustand** for client state (cart, auth), **TanStack React Query** for server state
- **Framer Motion** for animations

### Path alias
`@/*` maps to `./src/*`

### API Layer (`src/lib/api/`)
Two fetch-based clients:
- `client.ts` → `apiClient()` for public endpoints (products, orders)
- `admin-client.ts` → `adminClient()` for admin endpoints, auto-attaches JWT from auth store, handles 401 with silent token refresh

Domain-specific API modules (`products.ts`, `orders.ts`, `admin-products.ts`, etc.) wrap these clients.

### Hooks (`src/hooks/`)
React Query hooks (`use-products.ts`, `use-admin-orders.ts`, etc.) wrap API modules. Each hook file corresponds to one API domain.

### State Stores (`src/store/`)
- `cart.ts` — cart items, persisted to localStorage under key `"africa-cart"`
- `auth.ts` — JWT access/refresh tokens, persisted to localStorage under key `"admin-auth"`

### Routes
- `/` — homepage with hero, scroll-snap, product feed
- `/product/[slug]` — product detail page
- `/checkout` — multi-step checkout flow
- `/order/[id]` — order tracking
- `/artist/[slug]` — artist page
- `/admin/login` — admin login
- `/admin` — dashboard (guarded by `AdminGuard` component)
- `/admin/products`, `/admin/orders`, `/admin/artists` — CRUD pages

### Design System
Custom Tailwind config (`tailwind.config.ts`) defines:
- Colors: `pearl`, `coral`, `emerald`, custom `stone` scale
- Fonts: Inter (sans), Plus Jakarta Sans (jakarta), Space Grotesk (grotesk) — loaded via CSS variables
- Typography utilities: `.text-h1-hero`, `.text-h2-section`, `.text-body-prose`, `.text-label`
- Shadows: `soft`, `lift`, `glow`

### Admin Panel
Protected by `AdminGuard` which checks auth store for tokens. Sidebar navigation via `AdminSidebar`. Login page is excluded from the sidebar layout. Product and artist forms support S3 image uploads via pre-signed URLs from the backend.
