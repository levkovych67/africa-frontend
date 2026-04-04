import type { Metadata } from "next";
import { inter, plusJakartaSans, spaceGrotesk } from "@/lib/fonts";
import { Providers } from "@/lib/providers";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Офіційний мерч`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "AFRICA",
    "мерч",
    "мерч магазин",
    "футболки",
    "худі",
    "аксесуари",
    "Україна",
    "лімітована колекція",
    "українські артисти",
    "AFRICA SHOP",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    type: "website",
    locale: "uk_UA",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Офіційний мерч`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/images/newlogo.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Колекція 2026`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Офіційний мерч`,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/images/newlogo.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <head>
        <link rel="preconnect" href="https://africa-shop-dev.s3.eu-north-1.amazonaws.com" />
        <link rel="dns-prefetch" href="https://africa-shop-dev.s3.eu-north-1.amazonaws.com" />
      </head>
      <body className={`${inter.variable} ${plusJakartaSans.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
