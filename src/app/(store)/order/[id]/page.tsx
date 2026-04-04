import dynamic from "next/dynamic";
import { PageTransition } from "@/components/layout/page-transition";

const OrderTracker = dynamic(() => import("@/components/order/order-tracker").then(m => m.OrderTracker));

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: OrderPageProps) {
  const { id } = await params;
  return {
    title: `Замовлення ${id.slice(0, 8)}…`,
    robots: { index: false, follow: false },
  };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;

  return (
    <PageTransition>
      <main>
        <OrderTracker orderId={id} />
      </main>
    </PageTransition>
  );
}
