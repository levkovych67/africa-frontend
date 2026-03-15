import { ProductDetail } from "@/components/product/product-detail";
import { Header } from "@/components/layout/header";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { PageTransition } from "@/components/layout/page-transition";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${title} — AFRICA SHOP`,
    description: `${title} — КОЛЕКЦІЯ 2026`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  return (
    <>
      <Header />
      <CartDrawer />
      <PageTransition>
        <main>
          <ProductDetail slug={slug} />
        </main>
      </PageTransition>
    </>
  );
}
