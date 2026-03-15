import { ArtistDetail } from "@/components/artist/artist-detail";
import { Header } from "@/components/layout/header";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { PageTransition } from "@/components/layout/page-transition";

interface ArtistPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArtistPageProps) {
  const { slug } = await params;
  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${title} — AFRICA SHOP`,
    description: `${title} — артист`,
  };
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { slug } = await params;

  return (
    <>
      <Header />
      <CartDrawer />
      <PageTransition>
        <main>
          <ArtistDetail slug={slug} />
        </main>
      </PageTransition>
    </>
  );
}
