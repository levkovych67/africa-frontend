import { Metadata } from "next";
import { ArtistDetail } from "@/components/artist/artist-detail";
import { PageTransition } from "@/components/layout/page-transition";
import { getArtist } from "@/lib/api/artists";
import {
  SITE_URL,
  SITE_NAME,
  JsonLd,
  artistJsonLd,
  breadcrumbJsonLd,
} from "@/lib/seo";

interface ArtistPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const artist = await getArtist(slug);
    const description =
      artist.bio?.slice(0, 160) || `${artist.name} — артист AFRICA SHOP`;
    const url = `${SITE_URL}/artist/${artist.slug}`;

    return {
      title: artist.name,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "profile",
        title: `${artist.name} — ${SITE_NAME}`,
        description,
        url,
        siteName: SITE_NAME,
        images: artist.image
          ? [{ url: artist.image, alt: artist.name }]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: artist.name,
        description,
        images: artist.image ? [artist.image] : [],
      },
    };
  } catch {
    const title = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      title,
      description: `${title} — артист`,
    };
  }
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { slug } = await params;

  let artist = null;
  try {
    artist = await getArtist(slug);
  } catch {
    // API unavailable — skip JSON-LD
  }

  return (
    <>
      {artist && (
        <>
          <JsonLd data={artistJsonLd(artist)} />
          <JsonLd
            data={breadcrumbJsonLd([
              { name: "Головна", url: SITE_URL },
              { name: "Артисти", url: SITE_URL },
              { name: artist.name },
            ])}
          />
        </>
      )}
      <PageTransition>
        <main>
          <ArtistDetail slug={slug} />
        </main>
      </PageTransition>
    </>
  );
}
