import { Metadata } from "next";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/header";
import { PageTransition } from "@/components/layout/page-transition";
import { getProductBySlug } from "@/lib/api/products";

const CartDrawer = dynamic(() => import("@/components/cart/cart-drawer").then(m => m.CartDrawer));
const ProductDetail = dynamic(() => import("@/components/product/product-detail").then(m => m.ProductDetail));

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    return {
      title: `${product.title} — AFRICA SHOP`,
      description: product.description?.slice(0, 160) || `${product.title} — КОЛЕКЦІЯ 2026`,
      openGraph: {
        title: product.title,
        description: product.description?.slice(0, 160) || `${product.title} — КОЛЕКЦІЯ 2026`,
        images: product.images?.[0] ? [{ url: product.images[0] }] : [],
      },
    };
  } catch {
    const title = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      title: `${title} — AFRICA SHOP`,
      description: `${title} — КОЛЕКЦІЯ 2026`,
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  return (
    <>
      <Header />
      <CartDrawer />
      <PageTransition>
        <main className="bg-pearl py-8">
          <ProductDetail slug={slug} />
        </main>
      </PageTransition>
    </>
  );
}
