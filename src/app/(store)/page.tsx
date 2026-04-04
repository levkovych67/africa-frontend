import type { Metadata } from "next";
import { HomeContent } from "@/components/home/home-content";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  JsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Офіційний мерч-магазин`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: `${SITE_NAME} — Офіційний мерч-магазин`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    type: "website",
  },
};

export default function Home() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <HomeContent />
    </>
  );
}
