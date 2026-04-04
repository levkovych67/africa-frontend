# План фронтенду — Africa Merch Store

## Поточний стан

Фронтенд майже повністю готовий. Потрібно додати фільтри, оплату, спростити адмінку, robots/sitemap.

---

## Що є

- [x] Головна сторінка (hero + product feed)
- [x] Картка товару (каруселі, hover ефекти)
- [x] Сторінка товару (галерея + вибір варіантів + додати в кошик)
- [x] Кошик (drawer, Zustand, localStorage)
- [x] Checkout 3 кроки (контакти → Нова Пошта → оплата)
- [x] Сторінка артиста з товарами
- [x] Відстеження замовлення (`/order/[id]`)
- [x] 404 сторінка
- [x] Error boundary
- [x] Мобільна адаптивність
- [x] Адмін: логін JWT
- [x] Адмін: дашборд (виручка, замовлення, топ товари)
- [x] Адмін: CRUD товарів (з S3 upload, варіанти, атрибути)
- [x] Адмін: CRUD артистів
- [x] Адмін: список замовлень з пошуком і фільтром по статусу
- [x] Адмін: деталі замовлення зі зміною статусу
- [x] SEO metadata + OpenGraph (базовий)
- [x] Анімації (Framer Motion)

---

## Що треба зробити

### Ф1. Фільтри товарів на каталозі

**Нові файли:**
- `src/components/product/product-filters.tsx` — компонент фільтрів
- `src/hooks/use-product-filters.ts` — хук для отримання доступних фільтрів

**Змінити файли:**
- `src/hooks/use-products.ts` — додати параметри фільтрації
- `src/lib/api/products.ts` — додати query params (artistId, sort, attributes)
- `src/components/home/product-feed.tsx` — інтегрувати фільтри

**Компонент ProductFilters:**
- Фільтр по артисту (чекбокси, дані з `GET /api/v1/products/filters`)
- **Динамічні фільтри** — атрибути генеруються з API, не захардкоджені. Адмін додає "Матеріал" в товарі → фільтр з'являється автоматично
- Сортування: ціна ↑, ціна ↓, новинки
- Мобільна версія: кнопка "Фільтри" → drawer/modal

**API:**
```
GET /api/v1/products/filters →
{
  artists: [{ id, name, slug }],
  attributes: [
    { type: "Розмір", values: ["S", "M", "L", "XL"] },
    { type: "Колір", values: ["Чорний", "Білий"] }
  ]
}
```

---

### Ф2. Оплата в checkout (Monobank)

**Змінити файли:**
- `src/components/checkout/step-payment.tsx` — додати вибір способу оплати:
  - Радіо-кнопки: "Оплатити онлайн (Monobank)" / "Оплата при отриманні"
  - При виборі "онлайн" → після submit → redirect на Monobank
- `src/types/order.ts`:
  - Додати `paymentMethod: "online" | "cod"` в CheckoutPayload
  - Додати `WAITING_PAYMENT` в OrderStatus
- `src/lib/api/orders.ts` — додати `createPayment(orderId)` → `{ paymentUrl }`
- `src/hooks/use-checkout.ts` — обробити redirect після оплати
- `src/components/order/order-tracker.tsx` — показувати статус "Очікує оплати" для WAITING_PAYMENT

**Flow:**
```
Крок 3 (оплата) → вибір способу → Submit
  → Якщо COD: Order(PENDING) → success page
  → Якщо ONLINE: Order(WAITING_PAYMENT) → POST /payments/create → redirect на Monobank
    → Після оплати: Monobank callback → Order(PENDING) → redirect на /order/{id}
    → Якщо не оплатив 30 хв: auto-cancel + restore stock
```

---

### Ф3. Адмін: спрощення замовлень + ТТН

**Змінити файли:**
- `src/components/admin/orders/order-detail.tsx`:

**Кнопки по статусах (замість dropdown):**

| Поточний статус | Кнопки |
|----------------|--------|
| WAITING_PAYMENT | "❌ Відмінити" (сірий текст: "Очікує оплати") |
| PENDING | "✅ Підтвердити" + "❌ Відмінити" |
| CONFIRMED | "📦 Відправлено" |
| SHIPPED | "✅ Доставлено" |
| DELIVERED | — (фінальний статус) |
| CANCELLED | — (фінальний статус) |

**При натисканні "📦 Відправлено":**
- З'являється модалка з полем "Номер ТТН (Нова Пошта)"
- Поле обов'язкове — не можна зберегти без ТТН
- Після збереження: status=SHIPPED + trackingNumber → клієнт отримує email + telegram з ТТН

**Файли:**
- `src/components/admin/orders/order-detail.tsx` — кнопки + модалка ТТН
- `src/lib/api/admin-orders.ts` — оновити updateOrderStatus(id, {status, trackingNumber?})
- `src/types/admin.ts` — додати trackingNumber в UpdateStatusPayload

---

### Ф4. robots.txt + sitemap.xml (з кешуванням)

**Нові файли:**

`src/app/robots.ts`:
```ts
import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin/" },
    sitemap: "https://DOMAIN/sitemap.xml",
  };
}
```

`src/app/sitemap.ts`:
```ts
import type { MetadataRoute } from "next";

// Кешування — перегенерація раз на годину
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const artists = await getArtists();
  return [
    { url: "https://DOMAIN", lastModified: new Date(), changeFrequency: "daily" },
    ...products.map(p => ({
      url: `https://DOMAIN/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
    })),
    ...artists.map(a => ({
      url: `https://DOMAIN/artist/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
    })),
  ];
}
```

---

### Ф5. Оптимізація швидкості завантаження (без UI змін)

**Проблема зараз:**
- Всі компоненти завантажуються одразу (0 dynamic imports)
- CartDrawer з Framer Motion анімаціями завантажується навіть коли закритий
- Checkout, адмін-панель, overlay — все в initial bundle
- React Query staleTime тільки 5 хв, немає серверного кешу
- Next.js Image не налаштований (немає formats, quality, deviceSizes)
- Всі сторінки `"use client"` — немає SSR/SSG переваг

#### Ф5.1. Lazy loading — dynamic() для всього крім першого екрану

**Що завантажується одразу (above the fold):**
- Header (легкий — лого + кнопка кошика)
- HeroSection (hero зображення з `priority`)

**Що lazy-завантажується (dynamic import, ssr: false):**

`src/app/page.tsx`:
```tsx
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/header";
import { HeroSection } from "@/components/home/hero-section";

const CartDrawer = dynamic(() => import("@/components/cart/cart-drawer").then(m => m.CartDrawer), { ssr: false });
const ProductFeed = dynamic(() => import("@/components/home/product-feed").then(m => m.ProductFeed));
const Footer = dynamic(() => import("@/components/layout/footer").then(m => m.Footer));
const ScrollSnap = dynamic(() => import("@/components/home/scroll-snap").then(m => m.ScrollSnap), { ssr: false });
const ProductOverlay = dynamic(() => import("@/components/product/product-overlay").then(m => m.ProductOverlay), { ssr: false });
```

`src/app/product/[slug]/page.tsx`:
```tsx
const ImageGallery = dynamic(() => import("@/components/product/image-gallery").then(m => m.ImageGallery));
const CommandCenter = dynamic(() => import("@/components/product/command-center").then(m => m.CommandCenter));
// CartDrawer — lazy
```

`src/app/checkout/page.tsx`:
```tsx
const CheckoutForm = dynamic(() => import("@/components/checkout/checkout-form").then(m => m.CheckoutForm), { ssr: false });
```

**Адмін — весь lazy (рідко використовується):**
- Всі адмін-компоненти вже за окремими роутами, Next.js робить code-splitting по роутах автоматично — додаткових змін не потрібно.

**Файли для зміни:**
- `src/app/page.tsx` — dynamic imports
- `src/app/product/[slug]/page.tsx` — dynamic imports
- `src/app/checkout/page.tsx` — dynamic imports
- `src/app/order/[id]/page.tsx` — dynamic imports

#### Ф5.2. Next.js Image оптимізація

`next.config.ts`:
```ts
images: {
  formats: ["image/avif", "image/webp"],
  deviceSizes: [640, 750, 1080, 1920],
  imageSizes: [16, 32, 48, 64, 96, 128, 256],
  minimumCacheTTL: 3600, // 1 година кеш оптимізованих зображень
  remotePatterns: [/* існуючий S3 pattern */],
}
```

#### Ф5.3. React Query — збільшити кеш до 1 години

`src/lib/providers.tsx`:
```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 60 * 1000, // 1 година (було 5 хв)
      gcTime: 2 * 60 * 60 * 1000, // 2 години garbage collection
      refetchOnWindowFocus: false,
      refetchOnMount: false, // не рефетчити якщо дані свіжі
      retry: 1, // 1 retry замість 3 (швидше показуємо помилку)
    },
  },
});
```

#### Ф5.4. HTTP кеш-заголовки в API-клієнті

`src/lib/api/client.ts` — додати `next.revalidate` для fetch:
```tsx
// Для публічних GET-запитів (товари, артисти, фільтри):
fetch(url, { next: { revalidate: 3600 } }) // 1 година серверний кеш

// Для динамічних даних (замовлення, checkout):
fetch(url, { cache: "no-store" })
```

#### Ф5.5. Оптимізація зображень в компонентах

`src/components/product/image-gallery.tsx`:
- Thumbnails: додати `loading="lazy"` + `sizes="80px"` (зараз завантажуються всі одразу)

`src/components/product/product-card.tsx`:
- Додати `sizes` для мобільних каруселей: `sizes="(max-width: 768px) 100vw, 25vw"`

#### Ф5.6. Framer Motion — оптимізація scroll listeners

`src/components/home/hero-section.tsx`:
- Додати `willChange: "transform, opacity"` до scroll-driven елементів
- Використати `useMotionValueEvent` замість `useTransform` де можливо (менше ререндерів)

#### Ф5.7. Preconnect до S3

`src/app/layout.tsx`:
```tsx
<head>
  <link rel="preconnect" href="https://africa-shop-dev.s3.eu-north-1.amazonaws.com" />
  <link rel="dns-prefetch" href="https://africa-shop-dev.s3.eu-north-1.amazonaws.com" />
</head>
```

**Файли для зміни (зведено):**

| Файл | Зміна |
|------|-------|
| `src/app/page.tsx` | dynamic imports для CartDrawer, ProductFeed, Footer, ScrollSnap, Overlay |
| `src/app/product/[slug]/page.tsx` | dynamic imports для Gallery, CommandCenter, CartDrawer |
| `src/app/checkout/page.tsx` | dynamic import для CheckoutForm |
| `src/app/order/[id]/page.tsx` | dynamic import для OrderTracker |
| `src/app/layout.tsx` | preconnect S3 |
| `next.config.ts` | image formats, deviceSizes, minimumCacheTTL |
| `src/lib/providers.tsx` | staleTime 1 год, gcTime 2 год, refetchOnMount: false |
| `src/lib/api/client.ts` | next.revalidate для GET, no-store для mutations |
| `src/components/product/image-gallery.tsx` | lazy thumbnails |
| `src/components/home/hero-section.tsx` | willChange на scroll елементах |

---

## Порядок реалізації

| # | Задача | Залежить від (бекенд) |
|---|--------|-----------------------|
| 1 | **Оптимізація швидкості (Ф5)** | — (незалежно від бекенду) |
| 2 | Фільтри товарів (Ф1) | Б3 (product endpoints + /filters) |
| 3 | Адмін: кнопки + модалка ТТН (Ф3) | Б5 (admin order endpoints) |
| 4 | robots.txt + sitemap (Ф4) | Б3 (product/artist endpoints) |
| 5 | Оплата Monobank (Ф2) | Б8 (payment endpoints) |

---

## Структура файлів (після змін)

```
src/
├── app/
│   ├── page.tsx                    # оновити — dynamic imports (Ф5)
│   ├── robots.ts                   # НОВИЙ
│   ├── sitemap.ts                  # НОВИЙ
│   ├── layout.tsx                  # оновити — preconnect S3 (Ф5)
│   ├── product/[slug]/page.tsx     # оновити — dynamic imports (Ф5)
│   ├── checkout/page.tsx           # оновити — dynamic imports (Ф5)
│   ├── order/[id]/page.tsx         # оновити — dynamic imports (Ф5)
│   └── admin/...                   # без змін
├── components/
│   ├── product/
│   │   ├── product-filters.tsx     # НОВИЙ — динамічні фільтри
│   │   ├── product-grid.tsx        # оновити — інтеграція фільтрів
│   │   └── ...                     # без змін
│   ├── home/
│   │   └── hero-section.tsx        # оновити — willChange на scroll (Ф5)
│   ├── checkout/
│   │   └── step-payment.tsx        # оновити — вибір оплати (Monobank / COD)
│   ├── order/
│   │   └── order-tracker.tsx       # оновити — статус WAITING_PAYMENT
│   └── admin/orders/
│       └── order-detail.tsx        # оновити — кнопки + модалка ТТН
├── hooks/
│   ├── use-product-filters.ts      # НОВИЙ
│   ├── use-products.ts             # оновити — фільтр params
│   └── use-checkout.ts             # оновити — payment redirect
├── lib/
│   ├── providers.tsx               # оновити — staleTime 1год, gcTime 2год (Ф5)
│   └── api/
│       ├── client.ts               # оновити — next.revalidate для GET (Ф5)
│       ├── products.ts             # оновити — /filters endpoint, filter params
│       ├── orders.ts               # оновити — createPayment()
│       └── admin-orders.ts         # оновити — trackingNumber в updateStatus
└── types/
    ├── order.ts                    # оновити — paymentMethod, WAITING_PAYMENT
    └── admin.ts                    # оновити — trackingNumber
```
