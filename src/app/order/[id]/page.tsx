import dynamic from "next/dynamic";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/layout/page-transition";

const CartDrawer = dynamic(() => import("@/components/cart/cart-drawer").then(m => m.CartDrawer));
const OrderTracker = dynamic(() => import("@/components/order/order-tracker").then(m => m.OrderTracker));

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: OrderPageProps) {
  const { id } = await params;
  return {
    title: `Замовлення ${id.slice(0, 8)}… — AFRICA SHOP`,
  };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;

  return (
    <>
      <Header />
      <CartDrawer />
      <PageTransition>
        <main>
          <OrderTracker orderId={id} />
        </main>
      </PageTransition>
    </>
  );
}
