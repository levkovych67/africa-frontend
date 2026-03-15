import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Header } from "@/components/layout/header";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { PageTransition } from "@/components/layout/page-transition";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Оформлення замовлення — AFRICA SHOP",
};

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <CartDrawer />
      <PageTransition>
        <main className="py-12">
          <CheckoutForm />
        </main>
      </PageTransition>
    </>
  );
}
