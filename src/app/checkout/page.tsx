import dynamic from "next/dynamic";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/layout/page-transition";
import type { Metadata } from "next";

const CartDrawer = dynamic(() => import("@/components/cart/cart-drawer").then(m => m.CartDrawer));
const CheckoutForm = dynamic(() => import("@/components/checkout/checkout-form").then(m => m.CheckoutForm));

export const metadata: Metadata = {
  title: "Оформлення замовлення — AFRICA SHOP",
};

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <CartDrawer />
      <PageTransition>
        <main className="bg-pearl py-12">
          <CheckoutForm />
        </main>
      </PageTransition>
    </>
  );
}
