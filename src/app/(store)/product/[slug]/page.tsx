import { Metadata } from "next";
import dynamic from "next/dynamic";
import { PageTransition } from "@/components/layout/page-transition";
import { getProductBySlug } from "@/lib/api/products";
import {
  SITE_URL,
  SITE_NAME,
  JsonLd,
  productJsonLd,
  breadcrumbJsonLd,
} from "@/lib/seo";

const ProductDetail = dynamic(() => import("@/components/product/product-detail").then(m => m.ProductDetail));

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    const description =
      product.description?.slice(0, 160) || `${product.title} — КОЛЕКЦІЯ 2026`;
    const image = product.images?.[0];
    const url = `${SITE_URL}/product/${product.slug}`;

    return {
      title: product.title,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "website",
        title: `${product.title} — ${SITE_NAME}`,
        description,
        url,
        siteName: SITE_NAME,
        images: image
          ? [{ url: image, alt: product.title }]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: product.title,
        description,
        images: image ? [image] : [],
      },
    };
  } catch {
    const title = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      title,
      description: `${title} — КОЛЕКЦІЯ 2026`,
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let jsonLdElements = null;
  try {
    const product = await getProductBySlug(slug);
    jsonLdElements = (
      <>
        <JsonLd data={productJsonLd(product)} />
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Головна", url: SITE_URL },
            { name: "Каталог", url: SITE_URL },
            { name: product.title },
          ])}
        />
      </>
    );
  } catch {
    // API unavailable — skip JSON-LD
  }

  return (
    <>
      {jsonLdElements}
      <PageTransition>
        <main className="bg-pearl py-8">
          <ProductDetail slug={slug} />
        </main>
      </PageTransition>
    </>
  );
}
