"use client";

import { useState } from "react";
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
  const { addItem, openCart, items: cartItems } = useCartStore();

  const attributes = product.attributes ?? [];
  const variants = product.variants ?? [];

  const hasVariants = variants.length > 0;
  const hasAttributes = attributes.length > 0;

  const resolvedVariant = findVariant(variants, selectedAttributes);
  // If product has variants but no attribute selectors, auto-resolve to first variant
  const effectiveVariant = resolvedVariant
    ?? (hasVariants && !hasAttributes ? variants[0] : null);

  const price = effectiveVariant
    ? effectiveVariant.price
    : product.minPrice;

  // No variants = not purchasable (no stock tracking)
  const isInStock = hasVariants
    ? (effectiveVariant ? effectiveVariant.stock > 0 : false)
    : false;

  const allSelected = hasAttributes
    ? attributes.every((attr) => selectedAttributes[attr.type])
    : true;

  const cartItem = effectiveVariant
    ? cartItems.find((i) => i.sku === effectiveVariant.sku)
    : null;
  const alreadyInCart = cartItem ? cartItem.quantity : 0;
  const stockLeft = effectiveVariant ? effectiveVariant.stock - alreadyInCart : 0;

  const canAddToCart = hasVariants ? (allSelected && isInStock && stockLeft > 0) : false;

  const handleSelect = (type: string, value: string) => {
    setSelectedAttributes((prev) => ({ ...prev, [type]: value }));
  };

  const getUnavailableValues = (attrType: string): string[] => {
    const attr = attributes.find((a) => a.type === attrType);
    if (!attr) return [];

    // Build partial selection excluding the current attribute type
    const otherSelected = Object.fromEntries(
      Object.entries(selectedAttributes).filter(([k]) => k !== attrType)
    );
    const otherKeys = Object.keys(otherSelected);

    return (attr.values ?? []).filter((value) => {
      // Find variants matching this value AND all other selected attributes
      const matchingVariants = variants.filter(
        (v) =>
          v.attributes[attrType] === value &&
          otherKeys.every((k) => v.attributes[k] === otherSelected[k])
      );
      // Unavailable if no matching variant exists, or all matching have stock 0
      return matchingVariants.length === 0 || matchingVariants.every((v) => v.stock === 0);
    });
  };

  const handleAddToCart = () => {
    if (!effectiveVariant || !allSelected) return;

    const variantLabel = Object.keys(effectiveVariant.attributes).length > 0
      ? Object.entries(effectiveVariant.attributes).map(([k, v]) => `${k}: ${v}`).join(", ")
      : "";

    addItem({
      productId: product.id,
      productTitle: product.title,
      sku: effectiveVariant.sku,
      variantLabel,
      unitPrice: price,
      quantity: 1,
      maxStock: effectiveVariant.stock,
      image: (product.images ?? [])[0] || "",
    });

    openCart();
  };

  const allVariantsOutOfStock = hasVariants && variants.every((v) => v.stock === 0);

  return (
    <div className={compact ? "bg-white/70 backdrop-blur-md rounded-2xl p-5" : "sticky top-8 p-6 lg:p-8 bg-white/70 backdrop-blur-md rounded-2xl"}>
      <h1 className="text-h2-section font-jakarta font-bold">
        {product.title}
      </h1>

      {product.artistName && (
        <span className="text-sm text-stone-500 block mt-1">
          {product.artistName}
        </span>
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
          {!hasVariants
            ? "Немає в наявності"
            : allVariantsOutOfStock
              ? "Розпродано"
              : hasVariants && !allSelected
                ? "Оберіть варіант"
                : hasVariants && !isInStock
                  ? "Немає в наявності"
                  : stockLeft <= 0
                    ? "Максимум в кошику"
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
