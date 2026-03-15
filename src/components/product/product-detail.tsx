"use client";

import { useProduct } from "@/hooks/use-products";
import { ImageGallery } from "./image-gallery";
import { CommandCenter } from "./command-center";

interface ProductDetailProps {
  slug: string;
}

export function ProductDetail({ slug }: ProductDetailProps) {
  const { data: product, isLoading, error } = useProduct(slug);

  if (isLoading) {
    return (
      <div className="grid grid-cols-12 gap-0 px-6 py-8">
        <div className="col-span-12 lg:col-span-8">
          <div className="aspect-[3/4] bg-system-grey animate-pulse" />
        </div>
        <div className="col-span-12 lg:col-span-4 p-6">
          <div className="h-8 w-3/4 bg-system-grey animate-pulse mb-4" />
          <div className="h-6 w-1/4 bg-system-grey animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-20 text-center font-mono text-sm">
        Товар не знайдено
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-0">
      <div className="col-span-12 lg:col-span-8">
        <ImageGallery images={product.images} title={product.title} />
      </div>
      <div className="col-span-12 lg:col-span-4">
        <CommandCenter product={product} />
      </div>
    </div>
  );
}
