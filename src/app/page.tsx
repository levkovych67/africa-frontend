import { HeroSection } from "@/components/home/hero-section";
import { ProductFeed } from "@/components/home/product-feed";
import { Header } from "@/components/layout/header";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { PageTransition } from "@/components/layout/page-transition";

export default function Home() {
  return (
    <>
      <Header />
      <CartDrawer />
      <PageTransition>
        <main>
          <HeroSection />
          <section className="relative z-10 py-8">
            <ProductFeed />
          </section>
        </main>
      </PageTransition>
    </>
  );
}
