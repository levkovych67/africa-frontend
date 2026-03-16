import { Metadata } from "next";
import { ArtistDetail } from "@/components/artist/artist-detail";
import { Header } from "@/components/layout/header";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { PageTransition } from "@/components/layout/page-transition";
import { getArtist } from "@/lib/api/artists";

interface ArtistPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const artist = await getArtist(slug);
    return {
      title: `${artist.name} — AFRICA SHOP`,
      description: artist.bio?.slice(0, 160) || `${artist.name} — артист`,
      openGraph: {
        title: artist.name,
        description: artist.bio?.slice(0, 160) || `${artist.name} — артист`,
        images: artist.image ? [{ url: artist.image }] : [],
      },
    };
  } catch {
    const title = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      title: `${title} — AFRICA SHOP`,
      description: `${title} — артист`,
    };
  }
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
