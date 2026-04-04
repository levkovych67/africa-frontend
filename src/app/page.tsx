"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { HeroSection } from "@/components/home/hero-section";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/layout/page-transition";

const CartDrawer = dynamic(() => import("@/components/cart/cart-drawer").then(m => m.CartDrawer), { ssr: false });
const ProductFeed = dynamic(() => import("@/components/home/product-feed").then(m => m.ProductFeed));
const Footer = dynamic(() => import("@/components/layout/footer").then(m => m.Footer));
const ScrollSnap = dynamic(() => import("@/components/home/scroll-snap").then(m => m.ScrollSnap), { ssr: false });

export default function Home() {
  const productSectionRef = useRef<HTMLElement>(null);

  return (
    <>
      <Header />
      <CartDrawer />
      <HeroSection />
      <ScrollSnap targetRef={productSectionRef} />
      <PageTransition>
        <main>
          {/* Spacer to push content below the hero */}
          <div className="h-screen" />
          <section ref={productSectionRef} className="relative z-10 py-8">
            <ProductFeed />
          </section>
          <Footer />
        </main>
      </PageTransition>
    </>
  );
}
