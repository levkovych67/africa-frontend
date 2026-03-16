"use client";

import { use } from "react";
import Link from "next/link";
import { useAdminProduct } from "@/hooks/use-admin-products";
import { ProductForm } from "@/components/admin/products/product-form";

export default function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: product, isLoading, error } = useAdminProduct(id);

  return (
    <div>
      <Link
        href="/admin/products"
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Назад до товарів
      </Link>

      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        Редагувати товар
      </h1>

      {isLoading && <p className="text-gray-500 text-sm">Завантаження...</p>}
      {error && (
        <p className="text-red-600 text-sm">Помилка завантаження товару</p>
      )}
      {product && <ProductForm product={product} />}
    </div>
  );
}
