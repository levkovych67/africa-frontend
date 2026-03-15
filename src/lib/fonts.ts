import { Inter, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["cyrillic", "latin"],
  display: "swap",
});

export const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["cyrillic-ext", "latin"],
  display: "swap",
});

export const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});
