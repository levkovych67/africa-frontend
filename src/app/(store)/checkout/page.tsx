import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { PageTransition } from "@/components/layout/page-transition";
import type { Metadata } from "next";

const CheckoutForm = dynamic(() => import("@/components/checkout/checkout-form").then(m => m.CheckoutForm));

export const metadata: Metadata = {
  title: "Оформлення замовлення",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <PageTransition>
      <main className="min-h-screen bg-pearl flex flex-col lg:flex-row relative">
        {/* Left Side: Thematic Brand Image (Sticky on Desktop) */}
        <div className="relative w-full lg:w-[45%] h-[25vh] min-h-[220px] lg:h-screen lg:sticky lg:top-0 flex flex-col justify-between p-6 lg:p-12 border-b lg:border-b-0 lg:border-r border-stone-200/40 bg-stone-900 overflow-hidden">
          <Image
            src="/images/Checkout.webp"
            alt="AFRICA SHOP Колекція"
            fill
            priority
            className="object-cover opacity-60 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-transparent to-stone-900/90" />
          
          
          
          <div className="relative z-10 hidden lg:block mt-auto">
            <h2 className="font-jakarta font-bold text-3xl xl:text-4xl text-white tracking-tight leading-tight mb-3">
              Оформлення <br /> замовлення
            </h2>
            <div className="w-12 h-1 bg-coral mb-4" />
            <p className="text-stone-300 font-grotesk text-sm uppercase tracking-[0.1em]">
              Колекція 2026 — Лімітований випуск
            </p>
          </div>
        </div>

        {/* Right Side: Checkout Form */}
        <div className="w-full lg:w-[55%] flex justify-center py-10 lg:py-20 px-4 sm:px-6 lg:px-12 bg-pearl">
          <div className="w-full max-w-[600px] mx-auto">
            <div className="lg:hidden mb-10 text-center">
              <h2 className="font-jakarta font-bold text-2xl text-stone-900 tracking-tight mb-3">
                Оформлення замовлення
              </h2>
              <div className="w-8 h-1 bg-coral mx-auto" />
            </div>
            
            <CheckoutForm />
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
