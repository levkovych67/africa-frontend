import type { Metadata } from "next";
import { inter, plusJakartaSans, spaceGrotesk } from "@/lib/fonts";
import { Providers } from "@/lib/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "AFRICA SHOP",
  description: "КОЛЕКЦІЯ 2026 — ОБМЕЖЕНИЙ ТИРАЖ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className={`${inter.variable} ${plusJakartaSans.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
