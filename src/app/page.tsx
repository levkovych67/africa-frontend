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
