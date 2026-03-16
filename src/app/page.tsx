import { HeroSection } from "@/components/home/hero-section";
import { ProductFeed } from "@/components/home/product-feed";
import { Header } from "@/components/layout/header";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { PageTransition } from "@/components/layout/page-transition";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <>
      <Header />
      <CartDrawer />
      <HeroSection />
      <PageTransition>
        <main>
          {/* Spacer to push content below the hero */}
          <div className="h-screen" />
          <section className="relative z-10 py-8">
            <ProductFeed />
          </section>
          <Footer />
        </main>
      </PageTransition>
    </>
  );
}
