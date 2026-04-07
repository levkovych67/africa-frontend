"use client";

import { use } from "react";
import Link from "next/link";
import { useAdminOrder } from "@/hooks/use-admin-orders";
import { OrderDetail } from "@/components/admin/orders/order-detail";

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: order, isLoading, error } = useAdminOrder(id);

  return (
    <div>
      <Link
        href="/admin/orders"
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Назад до замовлень
      </Link>

      {isLoading && <p className="text-gray-500 text-sm">Завантаження...</p>}
      {error && (
        <p className="text-red-600 text-sm">Помилка завантаження замовлення</p>
      )}
      {order && <OrderDetail order={order} />}
    </div>
  );
}
