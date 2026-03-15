import { Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["cyrillic", "latin"],
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["cyrillic", "latin"],
  display: "swap",
});

export const webServeroff = localFont({
  src: "../../public/fonts/Web Serveroff.ttf",
  variable: "--font-serveroff",
  display: "swap",
});
