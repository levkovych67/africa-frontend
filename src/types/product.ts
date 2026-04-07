export interface ProductAttribute {
  type: string;
  values: string[];
}

export interface ProductVariant {
  sku: string;
  attributes: Record<string, string>;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  minPrice: number;
  attributes: ProductAttribute[];
  variants: ProductVariant[];
  images: string[];
  artistId: string | null;
  artistName: string | null;
  artistSlug: string | null;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
}

export interface ArtistFilter {
  id: string;
  name: string;
  slug: string;
}

export interface ProductFilters {
  artists: ArtistFilter[];
  attributes: ProductAttribute[];
}
