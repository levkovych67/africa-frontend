import { OrderTracker } from "@/components/order/order-tracker";
import { Header } from "@/components/layout/header";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { PageTransition } from "@/components/layout/page-transition";

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
