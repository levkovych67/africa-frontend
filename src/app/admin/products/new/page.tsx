"use client";

import { ProductForm } from "@/components/admin/products/product-form";

export default function AdminNewProductPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">
        Новий товар
      </h1>
      <ProductForm />
    </div>
  );
}
