import { ProductVariant } from "@/types/product";

export function findVariant(
  variants: ProductVariant[],
  selectedAttributes: Record<string, string>
): ProductVariant | null {
  const selectedKeys = Object.keys(selectedAttributes);
  if (selectedKeys.length === 0) return null;

  return (
    variants.find((variant) =>
      selectedKeys.every(
        (key) => variant.attributes[key] === selectedAttributes[key]
      )
    ) ?? null
  );
}
