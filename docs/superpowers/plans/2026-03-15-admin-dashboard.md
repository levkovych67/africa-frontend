# Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a functional admin dashboard with auth, analytics, product CRUD with S3 image uploads, and order management.

**Architecture:** Admin lives under `/admin/*` routes in the existing Next.js app with its own layout (sidebar + content area). JWT auth via Zustand with sessionStorage persistence. Admin API client wraps existing `apiClient` with auto-injected Bearer tokens and 401 refresh logic.

**Tech Stack:** Next.js 16 App Router, Tailwind v4, Zustand (persist), TanStack React Query, Recharts, Framer Motion

**Spec:** `docs/superpowers/specs/2026-03-15-admin-dashboard-design.md`

---

## Chunk 1: Foundation (Types, Auth Store, API Layer)

### Task 1: Install Dependencies & Update Types

**Files:**
- Modify: `package.json`
- Modify: `src/types/order.ts`
- Create: `src/types/admin-auth.ts`
- Create: `src/types/dashboard.ts`

- [ ] **Step 1: Install recharts**

```bash
npm install recharts
```

- [ ] **Step 2: Update OrderResponse.status to union type**

In `src/types/order.ts`, change `status: string` to:

```typescript
status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
```

- [ ] **Step 3: Create admin auth types**

Create `src/types/admin-auth.ts`:

```typescript
export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshPayload {
  refreshToken: string;
}
```

- [ ] **Step 4: Create dashboard types**

Create `src/types/dashboard.ts`:

```typescript
export interface TopProduct {
  productId: string;
  title: string;
  unitsSold: number;
  revenue: number;
}

export interface RevenueByDay {
  date: string;
  revenue: number;
  orders: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUnitsSold: number;
  topProducts: TopProduct[];
  revenueByDay: RevenueByDay[];
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```
Expected: Build succeeds with no type errors.

---

### Task 2: Auth Store (Zustand with sessionStorage)

**Files:**
- Create: `src/store/auth.ts`

- [ ] **Step 1: Create the auth store**

Create `src/store/auth.ts`:

```typescript
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthStore {
  accessToken: string | null;
  refreshToken: string | null;
  email: string | null;
  setTokens: (accessToken: string, refreshToken: string, email: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      email: null,

      setTokens: (accessToken, refreshToken, email) =>
        set({ accessToken, refreshToken, email }),

      setAccessToken: (accessToken) => set({ accessToken }),

      clearAuth: () =>
        set({ accessToken: null, refreshToken: null, email: null }),

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: "africa-admin-auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? sessionStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        email: state.email,
      }),
    }
  )
);
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

---

### Task 3: Admin API Client & Auth API Functions

**Files:**
- Create: `src/lib/api/admin-auth.ts`
- Create: `src/lib/api/admin-client.ts`

- [ ] **Step 1: Create auth API functions**

Create `src/lib/api/admin-auth.ts`:

```typescript
import { LoginPayload, AuthTokens, RefreshPayload } from "@/types/admin-auth";
import { apiClient } from "./client";

export async function login(payload: LoginPayload): Promise<AuthTokens> {
  return apiClient<AuthTokens>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function refreshToken(payload: RefreshPayload): Promise<AuthTokens> {
  return apiClient<AuthTokens>("/api/v1/auth/refresh", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
```

- [ ] **Step 2: Create admin API client with auth + refresh logic**

Create `src/lib/api/admin-client.ts`:

```typescript
import { useAuthStore } from "@/store/auth";
import { refreshToken } from "./admin-auth";
import { ApiRequestError } from "./client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function adminClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const { accessToken, refreshToken: storedRefreshToken, setAccessToken, clearAuth } =
    useAuthStore.getState();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options?.headers,
    },
  });

  if (response.status === 403) {
    throw new ApiRequestError({
      status: 403,
      error: "Forbidden",
      message: "Недостатньо прав",
      timestamp: new Date().toISOString(),
    });
  }

  if (response.status === 401 && storedRefreshToken) {
    try {
      const tokens = await refreshToken({ refreshToken: storedRefreshToken });
      setAccessToken(tokens.accessToken);

      const retryResponse = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.accessToken}`,
          ...options?.headers,
        },
      });

      if (!retryResponse.ok) {
        const error = await retryResponse.json().catch(() => ({
          status: retryResponse.status,
          error: retryResponse.statusText,
          message: "Запит не вдався після оновлення токена",
          timestamp: new Date().toISOString(),
        }));
        throw new ApiRequestError(error);
      }

      if (retryResponse.status === 204) return undefined as T;
      return retryResponse.json();
    } catch {
      clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
      throw new ApiRequestError({
        status: 401,
        error: "Unauthorized",
        message: "Сесія закінчилась",
        timestamp: new Date().toISOString(),
      });
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      status: response.status,
      error: response.statusText,
      message: "Сталася неочікувана помилка",
      timestamp: new Date().toISOString(),
    }));
    throw new ApiRequestError(error);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

---

### Task 4: Admin API Functions (Products, Orders, Dashboard, Images)

**Files:**
- Create: `src/lib/api/admin-products.ts`
- Create: `src/lib/api/admin-orders.ts`
- Create: `src/lib/api/admin-dashboard.ts`
- Create: `src/lib/api/admin-images.ts`

- [ ] **Step 1: Create admin products API**

Create `src/lib/api/admin-products.ts`:

```typescript
import { PaginatedResponse } from "@/types/api";
import { Product } from "@/types/product";
import { adminClient } from "./admin-client";

export async function getAdminProducts(params?: {
  page?: number;
  size?: number;
  sort?: string;
}): Promise<PaginatedResponse<Product>> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.set("page", String(params.page));
  if (params?.size !== undefined) searchParams.set("size", String(params.size));
  if (params?.sort) searchParams.set("sort", params.sort);

  const query = searchParams.toString();
  return adminClient<PaginatedResponse<Product>>(
    `/api/v1/admin/products${query ? `?${query}` : ""}`
  );
}

export async function createProduct(data: {
  title: string;
  description?: string;
  basePrice: number;
  attributes?: { type: string; values: string[] }[];
  variants?: {
    sku: string;
    attributes: Record<string, string>;
    priceModifier: number;
    stock: number;
  }[];
  images?: string[];
}): Promise<Product> {
  return adminClient<Product>("/api/v1/admin/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProduct(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    basePrice: number;
    attributes: { type: string; values: string[] }[];
    variants: {
      sku: string;
      attributes: Record<string, string>;
      priceModifier: number;
      stock: number;
    }[];
    images: string[];
    status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  }>
): Promise<Product> {
  return adminClient<Product>(`/api/v1/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function archiveProduct(id: string): Promise<void> {
  return adminClient<void>(`/api/v1/admin/products/${id}`, {
    method: "DELETE",
  });
}
```

- [ ] **Step 2: Create admin orders API**

Create `src/lib/api/admin-orders.ts`:

```typescript
import { PaginatedResponse } from "@/types/api";
import { OrderResponse } from "@/types/order";
import { adminClient } from "./admin-client";

export async function getAdminOrders(params?: {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  sort?: string;
}): Promise<PaginatedResponse<OrderResponse>> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) searchParams.set("page", String(params.page));
  if (params?.size !== undefined) searchParams.set("size", String(params.size));
  if (params?.search) searchParams.set("search", params.search);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.sort) searchParams.set("sort", params.sort);

  const query = searchParams.toString();
  return adminClient<PaginatedResponse<OrderResponse>>(
    `/api/v1/admin/orders${query ? `?${query}` : ""}`
  );
}

export async function updateOrderStatus(
  id: string,
  status: string
): Promise<OrderResponse> {
  return adminClient<OrderResponse>(`/api/v1/admin/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}
```

- [ ] **Step 3: Create admin dashboard API**

Create `src/lib/api/admin-dashboard.ts`:

```typescript
import { DashboardStats } from "@/types/dashboard";
import { adminClient } from "./admin-client";

export async function getDashboardStats(params?: {
  from?: string;
  to?: string;
}): Promise<DashboardStats> {
  const searchParams = new URLSearchParams();
  if (params?.from) searchParams.set("from", params.from);
  if (params?.to) searchParams.set("to", params.to);

  const query = searchParams.toString();
  return adminClient<DashboardStats>(
    `/api/v1/admin/dashboard/stats${query ? `?${query}` : ""}`
  );
}
```

- [ ] **Step 4: Create admin images API**

Create `src/lib/api/admin-images.ts`:

```typescript
import { adminClient } from "./admin-client";

interface PresignResponse {
  uploadUrl: string;
  publicUrl: string;
}

export async function getPresignedUrl(
  fileName: string,
  contentType: string
): Promise<PresignResponse> {
  return adminClient<PresignResponse>("/api/v1/admin/products/images/presign", {
    method: "POST",
    body: JSON.stringify({ fileName, contentType }),
  });
}

export async function uploadToS3(
  uploadUrl: string,
  file: File
): Promise<void> {
  await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

---

### Task 5: React Query Hooks for Admin

**Files:**
- Create: `src/hooks/use-auth.ts`
- Create: `src/hooks/use-admin-products.ts`
- Create: `src/hooks/use-admin-orders.ts`
- Create: `src/hooks/use-dashboard-stats.ts`
- Create: `src/hooks/use-image-upload.ts`

- [ ] **Step 1: Create auth hook**

Create `src/hooks/use-auth.ts`:

```typescript
"use client";

import { useMutation } from "@tanstack/react-query";
import { login } from "@/lib/api/admin-auth";
import { useAuthStore } from "@/store/auth";
import { LoginPayload } from "@/types/admin-auth";

export function useLogin() {
  const { setTokens } = useAuthStore();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (data, variables) => {
      setTokens(data.accessToken, data.refreshToken, variables.email);
    },
  });
}
```

- [ ] **Step 2: Create admin products hooks**

Create `src/hooks/use-admin-products.ts`:

```typescript
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  archiveProduct,
} from "@/lib/api/admin-products";

export function useAdminProducts(params?: {
  page?: number;
  size?: number;
  sort?: string;
}) {
  return useQuery({
    queryKey: ["admin-products", params],
    queryFn: () => getAdminProducts(params),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateProduct>[1] }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
}

export function useArchiveProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
}
```

- [ ] **Step 3: Create admin orders hooks**

Create `src/hooks/use-admin-orders.ts`:

```typescript
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminOrders, updateOrderStatus } from "@/lib/api/admin-orders";

export function useAdminOrders(params?: {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  sort?: string;
}) {
  return useQuery({
    queryKey: ["admin-orders", params],
    queryFn: () => getAdminOrders(params),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
}
```

- [ ] **Step 4: Create dashboard stats hook**

Create `src/hooks/use-dashboard-stats.ts`:

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/api/admin-dashboard";

export function useDashboardStats(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ["dashboard-stats", params],
    queryFn: () => getDashboardStats(params),
  });
}
```

- [ ] **Step 5: Create image upload hook**

Create `src/hooks/use-image-upload.ts`:

```typescript
"use client";

import { useState } from "react";
import { getPresignedUrl, uploadToS3 } from "@/lib/api/admin-images";

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export function useImageUpload() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const upload = async (file: File): Promise<string | null> => {
    setState({ isUploading: true, progress: 0, error: null });

    try {
      setState((prev) => ({ ...prev, progress: 30 }));
      const { uploadUrl, publicUrl } = await getPresignedUrl(
        file.name,
        file.type
      );

      setState((prev) => ({ ...prev, progress: 60 }));
      await uploadToS3(uploadUrl, file);

      setState({ isUploading: false, progress: 100, error: null });
      return publicUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Помилка завантаження";
      setState({ isUploading: false, progress: 0, error: message });
      return null;
    }
  };

  return { ...state, upload };
}
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```

---

## Chunk 2: Admin UI Components & Layout

### Task 6: Admin Design Tokens & CSS Scoping

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add admin tokens and border-radius scoping to globals.css**

Add to the `@theme` block in `src/app/globals.css`:

```css
  --color-admin-bg: #F8F9FA;
  --color-admin-surface: #FFFFFF;
  --color-admin-border: #E2E8F0;
  --color-admin-sidebar: #1A1A2E;
  --color-admin-sidebar-text: #E2E8F0;
  --color-admin-accent: #3B82F6;
  --color-admin-success: #22C55E;
  --color-admin-warning: #F59E0B;
  --color-admin-danger: #EF4444;
```

After the body rule, add:

```css
[data-admin] *,
[data-admin] *::before,
[data-admin] *::after {
  border-radius: unset !important;
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

---

### Task 7: Admin UI Primitives

**Files:**
- Create: `src/components/admin/ui/admin-button.tsx`
- Create: `src/components/admin/ui/admin-input.tsx`
- Create: `src/components/admin/ui/admin-select.tsx`
- Create: `src/components/admin/ui/admin-table.tsx`
- Create: `src/components/admin/ui/admin-modal.tsx`
- Create: `src/components/admin/ui/admin-toast.tsx`

- [ ] **Step 1: Create admin button**

Create `src/components/admin/ui/admin-button.tsx`:

```typescript
"use client";

import { ButtonHTMLAttributes } from "react";

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  loading?: boolean;
}

export function AdminButton({
  children,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  className = "",
  ...props
}: AdminButtonProps) {
  const base = "font-medium transition-colors rounded-lg";
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
  };
  const variants = {
    primary: "bg-admin-accent text-white hover:bg-admin-accent/90",
    secondary: "bg-admin-surface text-ink-primary border border-admin-border hover:bg-admin-bg",
    danger: "bg-admin-danger text-white hover:bg-admin-danger/90",
    ghost: "text-ink-primary hover:bg-admin-bg",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${
        disabled || loading ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Завантаження..." : children}
    </button>
  );
}
```

- [ ] **Step 2: Create admin input**

Create `src/components/admin/ui/admin-input.tsx`:

```typescript
"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface AdminInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function AdminInput({
  label,
  error,
  className = "",
  ...props
}: AdminInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-ink-primary/70">{label}</label>
      <input
        className={`px-3 py-2 text-sm border rounded-lg bg-admin-surface outline-none
          ${error ? "border-admin-danger" : "border-admin-border"}
          focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/20
          ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-admin-danger">{error}</span>}
    </div>
  );
}

interface AdminTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function AdminTextarea({
  label,
  error,
  className = "",
  ...props
}: AdminTextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-ink-primary/70">{label}</label>
      <textarea
        className={`px-3 py-2 text-sm border rounded-lg bg-admin-surface outline-none resize-y min-h-[100px]
          ${error ? "border-admin-danger" : "border-admin-border"}
          focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/20
          ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-admin-danger">{error}</span>}
    </div>
  );
}
```

- [ ] **Step 3: Create admin select**

Create `src/components/admin/ui/admin-select.tsx`:

```typescript
"use client";

import { SelectHTMLAttributes } from "react";

interface AdminSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function AdminSelect({
  label,
  options,
  className = "",
  ...props
}: AdminSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-ink-primary/70">
          {label}
        </label>
      )}
      <select
        className={`px-3 py-2 text-sm border border-admin-border rounded-lg bg-admin-surface outline-none
          focus:border-admin-accent focus:ring-1 focus:ring-admin-accent/20
          ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
```

- [ ] **Step 4: Create admin table**

Create `src/components/admin/ui/admin-table.tsx`:

```typescript
"use client";

import { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function AdminTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading,
}: AdminTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-admin-surface border border-admin-border rounded-lg overflow-hidden">
        <div className="animate-pulse">
          <div className="h-10 bg-admin-bg border-b border-admin-border" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-14 border-b border-admin-border last:border-0 flex items-center gap-4 px-4"
            >
              <div className="h-4 bg-admin-bg rounded w-1/4" />
              <div className="h-4 bg-admin-bg rounded w-1/6" />
              <div className="h-4 bg-admin-bg rounded w-1/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-admin-surface border border-admin-border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-admin-bg border-b border-admin-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left font-medium text-ink-primary/60 ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={`border-b border-admin-border last:border-0 ${
                onRowClick ? "cursor-pointer hover:bg-admin-bg/50" : ""
              }`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 ${col.className || ""}`}>
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between mt-4">
      <span className="text-sm text-ink-primary/60">
        Сторінка {page + 1} з {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="px-3 py-1 text-sm border border-admin-border rounded-lg disabled:opacity-30 hover:bg-admin-bg"
        >
          Назад
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="px-3 py-1 text-sm border border-admin-border rounded-lg disabled:opacity-30 hover:bg-admin-bg"
        >
          Далі
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create admin modal**

Create `src/components/admin/ui/admin-modal.tsx`:

```typescript
"use client";

import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function AdminModal({ isOpen, onClose, title, children }: AdminModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-admin-surface rounded-xl border border-admin-border w-full max-w-lg max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-admin-border">
                <h3 className="font-semibold">{title}</h3>
                <button onClick={onClose} className="text-ink-primary/40 hover:text-ink-primary">
                  ✕
                </button>
              </div>
              <div className="p-4">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 6: Create admin toast**

Create `src/components/admin/ui/admin-toast.tsx`:

```typescript
"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type: Toast["type"]) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type) => {
    const id = Date.now().toString();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function toast(message: string, type: Toast["type"] = "info") {
  useToastStore.getState().addToast(message, type);
}

export function AdminToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast: t, onClose }: { toast: Toast; onClose: () => void }) {
  const colors = {
    success: "bg-admin-success",
    error: "bg-admin-danger",
    info: "bg-admin-accent",
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className={`${colors[t.type]} text-white px-4 py-3 rounded-lg text-sm min-w-[250px] flex items-center justify-between`}
    >
      <span>{t.message}</span>
      <button onClick={onClose} className="ml-3 opacity-70 hover:opacity-100">
        ✕
      </button>
    </motion.div>
  );
}
```

- [ ] **Step 7: Verify build**

```bash
npm run build
```

---

### Task 8: Admin Layout, Sidebar & Auth Guard

**Files:**
- Create: `src/components/admin/layout/admin-sidebar.tsx`
- Create: `src/components/admin/layout/admin-guard.tsx`
- Create: `src/app/admin/layout.tsx`
- Create: `src/components/admin/orders/status-badge.tsx`

- [ ] **Step 1: Create status badge** (used across multiple pages)

Create `src/components/admin/orders/status-badge.tsx`:

```typescript
const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-admin-success/10 text-admin-success",
  DRAFT: "bg-admin-warning/10 text-admin-warning",
  ARCHIVED: "bg-ink-primary/10 text-ink-primary/50",
  PENDING: "bg-admin-warning/10 text-admin-warning",
  CONFIRMED: "bg-admin-accent/10 text-admin-accent",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-admin-success/10 text-admin-success",
  CANCELLED: "bg-admin-danger/10 text-admin-danger",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-md ${
        STATUS_STYLES[status] || "bg-ink-primary/10 text-ink-primary/50"
      }`}
    >
      {status}
    </span>
  );
}
```

- [ ] **Step 2: Create admin sidebar**

Create `src/components/admin/layout/admin-sidebar.tsx`:

```typescript
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

const NAV_ITEMS = [
  { href: "/admin", label: "Дашборд" },
  { href: "/admin/products", label: "Товари" },
  { href: "/admin/orders", label: "Замовлення" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { email, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.push("/admin/login");
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-admin-sidebar flex flex-col z-20">
      <div className="p-6 border-b border-white/10">
        <Link href="/admin" className="text-admin-sidebar-text font-semibold text-lg">
          AFRICA ADMIN
        </Link>
      </div>

      <nav className="flex-1 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-6 py-3 text-sm transition-colors ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-admin-sidebar-text/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <p className="text-xs text-admin-sidebar-text/50 truncate mb-2">
          {email}
        </p>
        <button
          onClick={handleLogout}
          className="text-sm text-admin-sidebar-text/70 hover:text-white"
        >
          Вийти
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Create admin auth guard**

Create `src/components/admin/layout/admin-guard.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/admin/login");
    } else {
      setChecked(true);
    }
  }, [isAuthenticated, router]);

  if (!checked) {
    return (
      <div className="flex h-screen items-center justify-center bg-admin-bg">
        <p className="text-sm text-ink-primary/40">Завантаження...</p>
      </div>
    );
  }

  return <>{children}</>;
}
```

- [ ] **Step 4: Create admin layout**

Create `src/app/admin/layout.tsx`:

```typescript
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { AdminGuard } from "@/components/admin/layout/admin-guard";
import { AdminToastContainer } from "@/components/admin/ui/admin-toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div data-admin className="min-h-screen bg-admin-bg">
        <AdminSidebar />
        <main className="ml-60 p-8">{children}</main>
        <AdminToastContainer />
      </div>
    </AdminGuard>
  );
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

---

## Chunk 3: Pages (Login, Dashboard, Products, Orders)

### Task 9: Login Page

**Files:**
- Create: `src/app/admin/login/page.tsx`

- [ ] **Step 1: Create login page** (no admin layout — standalone)

Note: The login page needs its own layout to exclude the sidebar and auth guard. Create `src/app/admin/login/layout.tsx`:

```typescript
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div data-admin>{children}</div>;
}
```

Create `src/app/admin/login/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/use-auth";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { ApiRequestError } from "@/lib/api/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await loginMutation.mutateAsync({ email, password });
      router.push("/admin");
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        setError("Невірні дані для входу");
      } else {
        setError("Сталася помилка. Спробуйте ще раз.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center">
      <div className="w-full max-w-sm bg-admin-surface rounded-xl border border-admin-border p-8">
        <h1 className="text-xl font-semibold text-center mb-8">
          AFRICA ADMIN
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <AdminInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <AdminInput
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-admin-danger text-center">{error}</p>
          )}

          <AdminButton type="submit" loading={loginMutation.isPending} className="w-full mt-2">
            Увійти
          </AdminButton>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

---

### Task 10: Dashboard Page

**Files:**
- Create: `src/components/admin/dashboard/stat-card.tsx`
- Create: `src/components/admin/dashboard/date-range-picker.tsx`
- Create: `src/components/admin/dashboard/revenue-chart.tsx`
- Create: `src/components/admin/dashboard/top-products-chart.tsx`
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: Create stat card**

Create `src/components/admin/dashboard/stat-card.tsx`:

```typescript
interface StatCardProps {
  label: string;
  value: string;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-admin-surface border border-admin-border rounded-lg p-6">
      <p className="text-sm text-ink-primary/60 mb-1">{label}</p>
      <p className="text-2xl font-semibold font-mono">{value}</p>
    </div>
  );
}
```

- [ ] **Step 2: Create date range picker**

Create `src/components/admin/dashboard/date-range-picker.tsx`:

```typescript
"use client";

interface DateRangePickerProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

export function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
}: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-ink-primary/60">Період:</label>
      <input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        className="px-3 py-1.5 text-sm border border-admin-border rounded-lg bg-admin-surface outline-none focus:border-admin-accent"
      />
      <span className="text-sm text-ink-primary/40">—</span>
      <input
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        className="px-3 py-1.5 text-sm border border-admin-border rounded-lg bg-admin-surface outline-none focus:border-admin-accent"
      />
    </div>
  );
}
```

- [ ] **Step 3: Create revenue chart**

Create `src/components/admin/dashboard/revenue-chart.tsx`:

```typescript
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { RevenueByDay } from "@/types/dashboard";

interface RevenueChartProps {
  data: RevenueByDay[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="bg-admin-surface border border-admin-border rounded-lg p-6">
      <h3 className="text-sm font-medium mb-4">Дохід за день</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(d) => d.slice(5)}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value.toFixed(2)} UAH`,
              name === "revenue" ? "Дохід" : "Замовлення",
            ]}
            labelFormatter={(label) => `Дата: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 4: Create top products chart**

Create `src/components/admin/dashboard/top-products-chart.tsx`:

```typescript
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TopProduct } from "@/types/dashboard";

interface TopProductsChartProps {
  data: TopProduct[];
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  return (
    <div className="bg-admin-surface border border-admin-border rounded-lg p-6">
      <h3 className="text-sm font-medium mb-4">Топ товари</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="title"
            tick={{ fontSize: 12 }}
            width={150}
          />
          <Tooltip
            formatter={(value: number) => [`${value} шт.`, "Продано"]}
          />
          <Bar dataKey="unitsSold" fill="#3B82F6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 5: Create dashboard page**

Create `src/app/admin/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { StatCard } from "@/components/admin/dashboard/stat-card";
import { DateRangePicker } from "@/components/admin/dashboard/date-range-picker";
import { RevenueChart } from "@/components/admin/dashboard/revenue-chart";
import { TopProductsChart } from "@/components/admin/dashboard/top-products-chart";
import { formatPrice } from "@/lib/utils/price";

function getDefaultDates() {
  const to = new Date().toISOString().split("T")[0];
  const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  return { from, to };
}

export default function AdminDashboardPage() {
  const [dates, setDates] = useState(getDefaultDates);
  const { data: stats, isLoading } = useDashboardStats(dates);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold">Дашборд</h1>
        <DateRangePicker
          from={dates.from}
          to={dates.to}
          onFromChange={(from) => setDates((prev) => ({ ...prev, from }))}
          onToChange={(to) => setDates((prev) => ({ ...prev, to }))}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 bg-admin-surface border border-admin-border rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard label="Загальний дохід" value={formatPrice(stats.totalRevenue)} />
            <StatCard label="Замовлення" value={String(stats.totalOrders)} />
            <StatCard label="Одиниць продано" value={String(stats.totalUnitsSold)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <RevenueChart data={stats.revenueByDay} />
            <TopProductsChart data={stats.topProducts} />
          </div>
        </>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```

---

### Task 11: Product List Page

**Files:**
- Create: `src/components/admin/products/product-table.tsx`
- Create: `src/app/admin/products/page.tsx`

- [ ] **Step 1: Create product table**

Create `src/components/admin/products/product-table.tsx`:

```typescript
"use client";

import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import { AdminTable, Pagination } from "@/components/admin/ui/admin-table";
import { StatusBadge } from "@/components/admin/orders/status-badge";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { useArchiveProduct } from "@/hooks/use-admin-products";
import { formatPrice } from "@/lib/utils/price";
import { toast } from "@/components/admin/ui/admin-toast";

interface ProductTableProps {
  products: Product[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export function ProductTable({
  products,
  page,
  totalPages,
  onPageChange,
  isLoading,
}: ProductTableProps) {
  const router = useRouter();
  const archiveMutation = useArchiveProduct();

  const handleArchive = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Архівувати цей товар?")) return;
    try {
      await archiveMutation.mutateAsync(id);
      toast("Товар архівовано", "success");
    } catch {
      toast("Помилка при архівації", "error");
    }
  };

  const columns = [
    {
      key: "title",
      header: "Назва",
      render: (p: Product) => <span className="font-medium">{p.title}</span>,
    },
    {
      key: "status",
      header: "Статус",
      render: (p: Product) => <StatusBadge status={p.status} />,
    },
    {
      key: "price",
      header: "Ціна",
      render: (p: Product) => (
        <span className="font-mono text-sm">{formatPrice(p.basePrice)}</span>
      ),
    },
    {
      key: "variants",
      header: "Варіанти",
      render: (p: Product) => <span>{p.variants.length}</span>,
    },
    {
      key: "created",
      header: "Створено",
      render: (p: Product) => (
        <span className="text-ink-primary/60">
          {new Date(p.createdAt).toLocaleDateString("uk-UA")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (p: Product) =>
        p.status !== "ARCHIVED" ? (
          <AdminButton
            variant="ghost"
            size="sm"
            onClick={(e) => handleArchive(e, p.id)}
          >
            Архівувати
          </AdminButton>
        ) : null,
    },
  ];

  return (
    <>
      <AdminTable
        columns={columns}
        data={products}
        keyExtractor={(p) => p.id}
        onRowClick={(p) => router.push(`/admin/products/${p.id}/edit`)}
        isLoading={isLoading}
      />
      {!isLoading && totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </>
  );
}
```

- [ ] **Step 2: Create products list page**

Create `src/app/admin/products/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminProducts } from "@/hooks/use-admin-products";
import { ProductTable } from "@/components/admin/products/product-table";
import { AdminButton } from "@/components/admin/ui/admin-button";

export default function AdminProductsPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useAdminProducts({
    page,
    size: 20,
    sort: "createdAt,desc",
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold">Товари</h1>
        <Link href="/admin/products/new">
          <AdminButton>Створити товар</AdminButton>
        </Link>
      </div>

      <ProductTable
        products={data?.content ?? []}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

---

### Task 12: Product Form (Create & Edit)

**Files:**
- Create: `src/components/admin/products/product-form.tsx`
- Create: `src/components/admin/products/image-uploader.tsx`
- Create: `src/components/admin/products/attribute-editor.tsx`
- Create: `src/components/admin/products/variant-table.tsx`
- Create: `src/app/admin/products/new/page.tsx`
- Create: `src/app/admin/products/[id]/edit/page.tsx`

- [ ] **Step 1: Create image uploader**

Create `src/components/admin/products/image-uploader.tsx`:

```typescript
"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useImageUpload } from "@/hooks/use-image-upload";
import { toast } from "@/components/admin/ui/admin-toast";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const { isUploading, upload } = useImageUpload();
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList) => {
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      for (const file of Array.from(files)) {
        if (!validTypes.includes(file.type)) {
          toast("Непідтримуваний формат. Використовуйте JPEG, PNG або WebP.", "error");
          continue;
        }
        const url = await upload(file);
        if (url) {
          onChange([...images, url]);
          toast("Зображення завантажено", "success");
        }
      }
    },
    [images, onChange, upload]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="text-sm font-medium text-ink-primary/70">Зображення</label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragOver
            ? "border-admin-accent bg-admin-accent/5"
            : "border-admin-border"
        }`}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/jpeg,image/png,image/webp";
          input.multiple = true;
          input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files) handleFiles(files);
          };
          input.click();
        }}
      >
        {isUploading ? (
          <p className="text-sm text-ink-primary/60">Завантаження...</p>
        ) : (
          <p className="text-sm text-ink-primary/40">
            Перетягніть зображення або натисніть для вибору
          </p>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative group">
              <div className="aspect-square relative rounded-lg overflow-hidden border border-admin-border">
                <Image
                  src={url}
                  alt={`Image ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="150px"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-admin-danger text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create attribute editor**

Create `src/components/admin/products/attribute-editor.tsx`:

```typescript
"use client";

import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminButton } from "@/components/admin/ui/admin-button";

interface AttributeGroup {
  type: string;
  values: string[];
}

interface AttributeEditorProps {
  attributes: AttributeGroup[];
  onChange: (attributes: AttributeGroup[]) => void;
}

export function AttributeEditor({ attributes, onChange }: AttributeEditorProps) {
  const addAttribute = () => {
    onChange([...attributes, { type: "", values: [] }]);
  };

  const updateType = (index: number, type: string) => {
    const updated = [...attributes];
    updated[index] = { ...updated[index], type };
    onChange(updated);
  };

  const updateValues = (index: number, valuesStr: string) => {
    const updated = [...attributes];
    updated[index] = {
      ...updated[index],
      values: valuesStr.split(",").map((v) => v.trim()).filter(Boolean),
    };
    onChange(updated);
  };

  const removeAttribute = (index: number) => {
    onChange(attributes.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-ink-primary/70">Атрибути</label>
        <AdminButton variant="secondary" size="sm" onClick={addAttribute} type="button">
          Додати атрибут
        </AdminButton>
      </div>

      {attributes.map((attr, i) => (
        <div key={i} className="flex gap-3 items-start">
          <AdminInput
            label="Тип"
            placeholder="Розмір, Колір..."
            value={attr.type}
            onChange={(e) => updateType(i, e.target.value)}
          />
          <div className="flex-1">
            <AdminInput
              label="Значення (через кому)"
              placeholder="S, M, L, XL"
              value={attr.values.join(", ")}
              onChange={(e) => updateValues(i, e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => removeAttribute(i)}
            className="mt-7 text-admin-danger hover:text-admin-danger/70 text-sm"
          >
            Видалити
          </button>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create variant table**

Create `src/components/admin/products/variant-table.tsx`:

```typescript
"use client";

interface VariantRow {
  sku: string;
  attributes: Record<string, string>;
  priceModifier: number;
  stock: number;
}

interface VariantTableProps {
  variants: VariantRow[];
  onChange: (variants: VariantRow[]) => void;
  attributeTypes: string[];
}

export function VariantTable({
  variants,
  onChange,
  attributeTypes,
}: VariantTableProps) {
  const updateVariant = (index: number, field: keyof VariantRow, value: string | number) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  if (variants.length === 0) {
    return (
      <p className="text-sm text-ink-primary/40">
        Додайте атрибути для генерації варіантів
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-ink-primary/70">Варіанти</label>
      <div className="border border-admin-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-admin-bg border-b border-admin-border">
              {attributeTypes.map((type) => (
                <th key={type} className="px-3 py-2 text-left font-medium text-ink-primary/60">
                  {type}
                </th>
              ))}
              <th className="px-3 py-2 text-left font-medium text-ink-primary/60">SKU</th>
              <th className="px-3 py-2 text-left font-medium text-ink-primary/60">Надбавка</th>
              <th className="px-3 py-2 text-left font-medium text-ink-primary/60">Запас</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v, i) => (
              <tr key={i} className="border-b border-admin-border last:border-0">
                {attributeTypes.map((type) => (
                  <td key={type} className="px-3 py-2 text-ink-primary/60">
                    {v.attributes[type] || "—"}
                  </td>
                ))}
                <td className="px-3 py-2">
                  <input
                    value={v.sku}
                    onChange={(e) => updateVariant(i, "sku", e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-admin-border rounded bg-admin-surface outline-none focus:border-admin-accent font-mono"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={v.priceModifier}
                    onChange={(e) => updateVariant(i, "priceModifier", parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-sm border border-admin-border rounded bg-admin-surface outline-none focus:border-admin-accent font-mono"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={v.stock}
                    onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-sm border border-admin-border rounded bg-admin-surface outline-none focus:border-admin-accent font-mono"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create product form**

Create `src/components/admin/products/product-form.tsx`:

```typescript
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-admin-products";
import { AdminInput, AdminTextarea } from "@/components/admin/ui/admin-input";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { ImageUploader } from "./image-uploader";
import { AttributeEditor } from "./attribute-editor";
import { VariantTable } from "./variant-table";
import { toast } from "@/components/admin/ui/admin-toast";
import { ApiRequestError } from "@/lib/api/client";
import { updateProduct as updateProductApi } from "@/lib/api/admin-products";

interface AttributeGroup {
  type: string;
  values: string[];
}

interface VariantRow {
  sku: string;
  attributes: Record<string, string>;
  priceModifier: number;
  stock: number;
}

interface ProductFormProps {
  product?: Product;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const [title, setTitle] = useState(product?.title ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [basePrice, setBasePrice] = useState(product?.basePrice ?? 0);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [attributes, setAttributes] = useState<AttributeGroup[]>(
    product?.attributes ?? []
  );
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants ?? []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const attributeTypes = useMemo(
    () => attributes.map((a) => a.type).filter(Boolean),
    [attributes]
  );

  // Auto-generate variant combinations when attributes change
  useEffect(() => {
    const validAttrs = attributes.filter(
      (a) => a.type && a.values.length > 0
    );
    if (validAttrs.length === 0) {
      if (!product) setVariants([]);
      return;
    }

    const combinations = validAttrs.reduce<Record<string, string>[]>(
      (acc, attr) => {
        if (acc.length === 0) {
          return attr.values.map((v) => ({ [attr.type]: v }));
        }
        return acc.flatMap((combo) =>
          attr.values.map((v) => ({ ...combo, [attr.type]: v }))
        );
      },
      []
    );

    setVariants((prev) => {
      return combinations.map((combo) => {
        const existing = prev.find((v) =>
          Object.entries(combo).every(
            ([k, val]) => v.attributes[k] === val
          )
        );
        const skuParts = Object.values(combo)
          .map((v) => v.toUpperCase().slice(0, 3))
          .join("-");
        return existing || {
          sku: skuParts,
          attributes: combo,
          priceModifier: 0,
          stock: 0,
        };
      });
    });
  }, [attributes, product]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Обов'язкове поле";
    if (basePrice <= 0) errs.basePrice = "Ціна повинна бути більше 0";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (publish: boolean) => {
    if (!validate()) return;

    const data = {
      title,
      description: description || undefined,
      basePrice,
      attributes: attributes.filter((a) => a.type && a.values.length > 0),
      variants,
      images,
    };

    try {
      if (product) {
        await updateMutation.mutateAsync({
          id: product.id,
          data: { ...data, status: publish ? "ACTIVE" : undefined },
        });
        toast("Товар оновлено", "success");
      } else {
        const created = await createMutation.mutateAsync(data);
        if (publish) {
          await updateProductApi(created.id, { status: "ACTIVE" });
        }
        toast(publish ? "Товар опубліковано" : "Чернетку збережено", "success");
      }
      router.push("/admin/products");
    } catch (err) {
      if (err instanceof ApiRequestError) {
        toast(err.message, "error");
      } else {
        toast("Сталася помилка", "error");
      }
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="max-w-3xl flex flex-col gap-8"
    >
      <AdminInput
        label="Назва"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        required
      />
      <AdminTextarea
        label="Опис"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <AdminInput
        label="Базова ціна (UAH)"
        type="number"
        step="0.01"
        value={basePrice || ""}
        onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
        error={errors.basePrice}
        required
      />

      <ImageUploader images={images} onChange={setImages} />
      <AttributeEditor attributes={attributes} onChange={setAttributes} />
      <VariantTable
        variants={variants}
        onChange={setVariants}
        attributeTypes={attributeTypes}
      />

      <div className="flex gap-3 pt-4 border-t border-admin-border">
        <AdminButton
          type="button"
          variant="secondary"
          onClick={() => handleSave(false)}
          loading={isSubmitting}
        >
          Зберегти як чернетку
        </AdminButton>
        <AdminButton
          type="button"
          onClick={() => handleSave(true)}
          loading={isSubmitting}
        >
          Опублікувати
        </AdminButton>
        <AdminButton
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/products")}
        >
          Скасувати
        </AdminButton>
      </div>
    </form>
  );
}
```

- [ ] **Step 5: Create product pages (new + edit)**

Create `src/app/admin/products/new/page.tsx`:

```typescript
import { ProductForm } from "@/components/admin/products/product-form";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-8">Створити товар</h1>
      <ProductForm />
    </div>
  );
}
```

Create `src/app/admin/products/[id]/edit/page.tsx`:

```typescript
"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client";
import { Product } from "@/types/product";
import { ProductForm } from "@/components/admin/products/product-form";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: product, isLoading } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => adminClient<Product>(`/api/v1/admin/products/${id}`),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl">
        <div className="h-8 w-48 bg-admin-bg rounded animate-pulse mb-8" />
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-admin-bg rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!product) {
    return <p className="text-sm text-ink-primary/60">Товар не знайдено</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-8">Редагувати товар</h1>
      <ProductForm product={product} />
    </div>
  );
}
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```

---

### Task 13: Orders Page

**Files:**
- Create: `src/components/admin/orders/order-table.tsx`
- Create: `src/components/admin/orders/order-detail.tsx`
- Create: `src/components/admin/orders/status-updater.tsx`
- Create: `src/app/admin/orders/page.tsx`

- [ ] **Step 1: Create status updater**

Create `src/components/admin/orders/status-updater.tsx`:

```typescript
"use client";

import { AdminSelect } from "@/components/admin/ui/admin-select";
import { useUpdateOrderStatus } from "@/hooks/use-admin-orders";
import { toast } from "@/components/admin/ui/admin-toast";

const ORDER_STATUSES = [
  { value: "PENDING", label: "PENDING" },
  { value: "CONFIRMED", label: "CONFIRMED" },
  { value: "SHIPPED", label: "SHIPPED" },
  { value: "DELIVERED", label: "DELIVERED" },
  { value: "CANCELLED", label: "CANCELLED" },
];

interface StatusUpdaterProps {
  orderId: string;
  currentStatus: string;
}

export function StatusUpdater({ orderId, currentStatus }: StatusUpdaterProps) {
  const mutation = useUpdateOrderStatus();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;
    if (!confirm(`Змінити статус на ${newStatus}?`)) return;

    try {
      await mutation.mutateAsync({ id: orderId, status: newStatus });
      toast("Статус оновлено", "success");
    } catch {
      toast("Помилка при оновленні статусу", "error");
    }
  };

  return (
    <AdminSelect
      options={ORDER_STATUSES}
      value={currentStatus}
      onChange={handleChange}
    />
  );
}
```

- [ ] **Step 2: Create order detail modal**

Create `src/components/admin/orders/order-detail.tsx`:

```typescript
"use client";

import { OrderResponse } from "@/types/order";
import { AdminModal } from "@/components/admin/ui/admin-modal";
import { StatusBadge } from "./status-badge";
import { StatusUpdater } from "./status-updater";
import { formatPrice } from "@/lib/utils/price";

interface OrderDetailProps {
  order: OrderResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderDetail({ order, isOpen, onClose }: OrderDetailProps) {
  if (!order) return null;

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={`Замовлення`}>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-xs text-ink-primary/40 font-mono mb-2">{order.id}</p>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            <StatusUpdater orderId={order.id} currentStatus={order.status} />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Клієнт</h4>
          <p className="text-sm">{order.firstName} {order.lastName}</p>
          <p className="text-sm text-ink-primary/60">{order.email}</p>
          <p className="text-sm text-ink-primary/60">{order.phone}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Товари</h4>
          <div className="flex flex-col gap-2">
            {order.items.map((item) => (
              <div key={item.sku} className="flex justify-between text-sm">
                <div>
                  <p>{item.productTitle}</p>
                  <p className="text-xs text-ink-primary/60 font-mono">
                    {item.variantName} x{item.quantity}
                  </p>
                </div>
                <span className="font-mono">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-admin-border font-medium text-sm">
            <span>Разом</span>
            <span className="font-mono">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Доставка</h4>
          <p className="text-sm">{order.shippingDetails.address}</p>
          <p className="text-sm">{order.shippingDetails.city}, {order.shippingDetails.postalCode}</p>
          <p className="text-sm">{order.shippingDetails.country}</p>
          {order.shippingDetails.trackingNumber && (
            <p className="text-sm mt-2 font-mono">
              Трекінг: {order.shippingDetails.trackingNumber} ({order.shippingDetails.carrier})
            </p>
          )}
        </div>

        <p className="text-xs text-ink-primary/40">
          Створено: {new Date(order.createdAt).toLocaleString("uk-UA")}
        </p>
      </div>
    </AdminModal>
  );
}
```

- [ ] **Step 3: Create order table**

Create `src/components/admin/orders/order-table.tsx`:

```typescript
"use client";

import { OrderResponse } from "@/types/order";
import { AdminTable, Pagination } from "@/components/admin/ui/admin-table";
import { StatusBadge } from "./status-badge";
import { formatPrice } from "@/lib/utils/price";

interface OrderTableProps {
  orders: OrderResponse[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRowClick: (order: OrderResponse) => void;
  isLoading: boolean;
}

export function OrderTable({
  orders,
  page,
  totalPages,
  onPageChange,
  onRowClick,
  isLoading,
}: OrderTableProps) {
  const columns = [
    {
      key: "id",
      header: "ID",
      render: (o: OrderResponse) => (
        <span className="font-mono text-xs">{o.id.slice(0, 8)}...</span>
      ),
    },
    {
      key: "customer",
      header: "Клієнт",
      render: (o: OrderResponse) => (
        <span>{o.firstName} {o.lastName}</span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (o: OrderResponse) => (
        <span className="text-ink-primary/60">{o.email}</span>
      ),
    },
    {
      key: "total",
      header: "Сума",
      render: (o: OrderResponse) => (
        <span className="font-mono">{formatPrice(o.totalAmount)}</span>
      ),
    },
    {
      key: "status",
      header: "Статус",
      render: (o: OrderResponse) => <StatusBadge status={o.status} />,
    },
    {
      key: "date",
      header: "Дата",
      render: (o: OrderResponse) => (
        <span className="text-ink-primary/60">
          {new Date(o.createdAt).toLocaleDateString("uk-UA")}
        </span>
      ),
    },
  ];

  return (
    <>
      <AdminTable
        columns={columns}
        data={orders}
        keyExtractor={(o) => o.id}
        onRowClick={onRowClick}
        isLoading={isLoading}
      />
      {!isLoading && totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </>
  );
}
```

- [ ] **Step 4: Create orders page**

Create `src/app/admin/orders/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useAdminOrders } from "@/hooks/use-admin-orders";
import { OrderResponse } from "@/types/order";
import { OrderTable } from "@/components/admin/orders/order-table";
import { OrderDetail } from "@/components/admin/orders/order-detail";
import { AdminSelect } from "@/components/admin/ui/admin-select";
import { AdminInput } from "@/components/admin/ui/admin-input";

const STATUS_OPTIONS = [
  { value: "", label: "Усі статуси" },
  { value: "PENDING", label: "PENDING" },
  { value: "CONFIRMED", label: "CONFIRMED" },
  { value: "SHIPPED", label: "SHIPPED" },
  { value: "DELIVERED", label: "DELIVERED" },
  { value: "CANCELLED", label: "CANCELLED" },
];

export default function AdminOrdersPage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

  const { data, isLoading } = useAdminOrders({
    page,
    size: 20,
    status: statusFilter || undefined,
    search: search || undefined,
    sort: "createdAt,desc",
  });

  return (
    <div>
      <h1 className="text-xl font-semibold mb-8">Замовлення</h1>

      <div className="flex gap-4 mb-6">
        <div className="w-48">
          <AdminSelect
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <div className="w-64">
          <AdminInput
            label=""
            placeholder="Пошук за email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </div>
      </div>

      <OrderTable
        orders={data?.content ?? []}
        page={page}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        onRowClick={setSelectedOrder}
        isLoading={isLoading}
      />

      <OrderDetail
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```
Expected: Build succeeds. All admin routes compile.

---

## Chunk 4: Final Verification

### Task 14: Full Build & Smoke Test

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected output should include all admin routes:
```
○ /admin
○ /admin/login
○ /admin/orders
○ /admin/products
○ /admin/products/new
ƒ /admin/products/[id]/edit
```

- [ ] **Step 2: Start dev server and verify manually**

```bash
npm run dev
```

Verify:
1. Visit `/admin/login` — login form renders
2. Login with credentials → redirects to `/admin` dashboard
3. Navigate to `/admin/products` — table renders
4. Click "Створити товар" → product form renders with all sections
5. Navigate to `/admin/orders` — table renders with filters
6. Click an order row → detail modal opens
7. Storefront at `/` still works independently
