"use client";

import { useState } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { useCartStore } from "@/store/cart";
import { findVariant } from "@/lib/utils/variant";
import { formatPrice } from "@/lib/utils/price";
import { PrecisionButton } from "@/components/ui/precision-button";
import { SizeSelector } from "@/components/ui/size-selector";


interface CommandCenterProps {
  product: Product;
  compact?: boolean;
}

export function CommandCenter({ product, compact = false }: CommandCenterProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
  const { addItem, openCart } = useCartStore();

  const attributes = product.attributes ?? [];
  const variants = product.variants ?? [];

  const hasVariants = variants.length > 0;
  const hasAttributes = attributes.length > 0;

  const resolvedVariant = findVariant(variants, selectedAttributes);
  const price = resolvedVariant
    ? product.basePrice + resolvedVariant.priceModifier
    : product.basePrice;

  // Simple product (no variants): always in stock
  // Product with variants: check resolved variant stock
  const isInStock = hasVariants
    ? (resolvedVariant ? resolvedVariant.stock > 0 : false)
    : true;

  const allSelected = hasAttributes
    ? attributes.every((attr) => selectedAttributes[attr.type])
    : true;

  const canAddToCart = hasVariants ? (allSelected && isInStock) : true;

  const handleSelect = (type: string, value: string) => {
    setSelectedAttributes((prev) => ({ ...prev, [type]: value }));
  };

  const getUnavailableValues = (attrType: string): string[] => {
    const attr = attributes.find((a) => a.type === attrType);
    if (!attr) return [];
    return (attr.values ?? []).filter((value) => {
      const matchingVariants = variants.filter(
        (v) => v.attributes[attrType] === value
      );
      return matchingVariants.length > 0 && matchingVariants.every((v) => v.stock === 0);
    });
  };

  const handleAddToCart = () => {
    if (hasVariants) {
      if (!resolvedVariant || !allSelected) return;

      const variantLabel = Object.entries(resolvedVariant.attributes)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");

      addItem({
        productId: product.id,
        productTitle: product.title,
        sku: resolvedVariant.sku,
        variantLabel,
        unitPrice: price,
        quantity: 1,
        image: (product.images ?? [])[0] || "",
      });
    } else {
      // Simple product — no variants
      addItem({
        productId: product.id,
        productTitle: product.title,
        sku: product.slug || product.id,
        variantLabel: "",
        unitPrice: product.basePrice,
        quantity: 1,
        image: (product.images ?? [])[0] || "",
      });
    }

    openCart();
  };

  const allVariantsOutOfStock = hasVariants && variants.every((v) => v.stock === 0);

  return (
    <div className={compact ? "bg-white/70 backdrop-blur-md rounded-2xl p-5" : "sticky top-8 p-6 lg:p-8 bg-white/70 backdrop-blur-md rounded-2xl"}>
      <h1 className="text-h2-section font-jakarta font-bold">
        {product.title}
      </h1>

      {product.artistName && (
        <Link
          href={`/artist/${product.artistSlug}`}
          className="text-sm text-stone-500 hover:text-coral block mt-1"
        >
          {product.artistName}
        </Link>
      )}

      <p className="font-grotesk text-xl mt-2">{formatPrice(price)}</p>

      {allVariantsOutOfStock && (
        <p className="font-jakarta font-bold text-xs text-coral mt-2 uppercase tracking-wider">
          Розпродано
        </p>
      )}

      <div className="mt-8 flex flex-col gap-6">
        {attributes.map((attr) => (
          <SizeSelector
            key={attr.type}
            label={attr.type}
            values={attr.values ?? []}
            selected={selectedAttributes[attr.type] || null}
            onSelect={(value) => handleSelect(attr.type, value)}
            unavailableValues={getUnavailableValues(attr.type)}
          />
        ))}
      </div>

      <div className="mt-8">
        <PrecisionButton
          onClick={handleAddToCart}
          disabled={!canAddToCart || allVariantsOutOfStock}
          className="w-full"
        >
          {allVariantsOutOfStock
            ? "Розпродано"
            : hasVariants && !allSelected
              ? "Оберіть варіант"
              : hasVariants && !isInStock
                ? "Немає в наявності"
                : "Додати в кошик"}
        </PrecisionButton>
      </div>

      {product.description && (
        <div className="mt-8">
          <h3 className="font-jakarta font-bold text-xs uppercase tracking-wider mb-2">Опис</h3>
          <p className="text-sm leading-relaxed text-stone-600">{product.description}</p>
        </div>
      )}
    </div>
  );
}
