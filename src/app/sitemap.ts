import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/api/products";
import { getArtists } from "@/lib/api/artists";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://africa-shop.com.ua";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  // Fetch all products with pagination
  try {
    let page = 0;
    let hasMore = true;
    while (hasMore) {
      const products = await getProducts({ page, size: 100 });
      for (const p of products.content) {
        entries.push({
          url: `${SITE_URL}/product/${p.slug}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(p.createdAt),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
      hasMore = !products.last;
      page++;
    }
  } catch {
    // Products API unavailable — skip
  }

  // Fetch all artists
  try {
    const artists = await getArtists();
    for (const a of artists) {
      entries.push({
        url: `${SITE_URL}/artist/${a.slug}`,
        lastModified: a.updatedAt ? new Date(a.updatedAt) : new Date(a.createdAt),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch {
    // Artists API unavailable — skip
  }

  return entries;
}
