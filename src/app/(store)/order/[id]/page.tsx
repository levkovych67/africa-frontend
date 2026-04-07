import dynamic from "next/dynamic";
import { PageTransition } from "@/components/layout/page-transition";

const OrderTracker = dynamic(() => import("@/components/order/order-tracker").then(m => m.OrderTracker));

interface OrderPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ accessToken?: string }>;
}

export async function generateMetadata({ params }: OrderPageProps) {
  const { id } = await params;
  return {
    title: `Замовлення ${id.slice(0, 8)}…`,
    robots: { index: false, follow: false },
  };
}

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  const { id } = await params;
  const { accessToken } = await searchParams;

  return (
    <PageTransition>
      <main>
        <OrderTracker orderId={id} accessToken={accessToken} />
      </main>
    </PageTransition>
  );
}
