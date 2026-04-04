import type { Product } from "@/types/product";
import type { Artist } from "@/types/artist";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://africa-shop.com.ua";
export const SITE_NAME = "AFRICA SHOP";
export const SITE_DESCRIPTION =
  "AFRICA SHOP — офіційний мерч-магазин бренду AFRICA. Колекція 2026, обмежений тираж. Футболки, худі та аксесуари від українських артистів.";

/* ------------------------------------------------------------------ */
/*  JSON-LD helpers — return plain objects for <script type="application/ld+json">  */
/* ------------------------------------------------------------------ */

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/new%20logo.webp`,
    description: SITE_DESCRIPTION,
    sameAs: [],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "uk-UA",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(product: Product) {
  const inStock = product.variants.some((v) => v.stock > 0);
  const prices = product.variants.map((v) => product.basePrice + v.priceModifier);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images,
    sku: product.variants[0]?.sku,
    url: `${SITE_URL}/product/${product.slug}`,
    brand: {
      "@type": "Brand",
      name: "AFRICA",
    },
    ...(product.artistName && {
      creator: {
        "@type": "Person",
        name: product.artistName,
        url: product.artistSlug
          ? `${SITE_URL}/artist/${product.artistSlug}`
          : undefined,
      },
    }),
    offers:
      minPrice === maxPrice
        ? {
            "@type": "Offer",
            url: `${SITE_URL}/product/${product.slug}`,
            priceCurrency: "UAH",
            price: minPrice,
            availability: inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            seller: { "@type": "Organization", name: SITE_NAME },
          }
        : {
            "@type": "AggregateOffer",
            url: `${SITE_URL}/product/${product.slug}`,
            priceCurrency: "UAH",
            lowPrice: minPrice,
            highPrice: maxPrice,
            offerCount: product.variants.length,
            availability: inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            seller: { "@type": "Organization", name: SITE_NAME },
          },
  };
}

export function artistJsonLd(artist: Artist) {
  const sameAs = Object.values(artist.socialLinks || {}).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: artist.name,
    description: artist.bio,
    url: `${SITE_URL}/artist/${artist.slug}`,
    image: artist.image || undefined,
    ...(sameAs.length > 0 && { sameAs }),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url?: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };
}

/** Renders one or more JSON-LD objects as a <script> tag */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
