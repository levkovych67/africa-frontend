"use client";

import { useRef } from "react";
import { HeroSection } from "@/components/home/hero-section";
import { ProductFeed } from "@/components/home/product-feed";
import { Header } from "@/components/layout/header";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { PageTransition } from "@/components/layout/page-transition";
import { Footer } from "@/components/layout/footer";
import { ScrollSnap } from "@/components/home/scroll-snap";

export default function Home() {
  const productSectionRef = useRef<HTMLElement>(null);

  return (
    <>
      <Header />
      <CartDrawer />
      <ScrollSnap targetRef={productSectionRef} />
      <PageTransition>
        <main>
          <HeroSection />
          <section ref={productSectionRef} className="relative z-10 py-8">
            <ProductFeed />
          </section>
          <Footer />
        </main>
      </PageTransition>
    </>
  );
}
