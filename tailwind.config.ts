import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pearl: "#FDFCFB",
        coral: "#FF5A5F",
        emerald: "#10B981",
        stone: {
          50: "#FAFAF9",
          100: "#F5F5F4",
          200: "#E7E5E4",
          500: "#78716C",
          900: "#1C1917",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Helvetica Neue", "Arial", "sans-serif"],
        jakarta: ["var(--font-jakarta)", "var(--font-inter)", "sans-serif"],
        grotesk: ["var(--font-space-grotesk)", "var(--font-inter)", "monospace"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(28,25,23,0.05)",
        lift: "0 20px 40px rgba(28,25,23,0.08)",
        glow: "0 0 20px rgba(255,90,95,0.15)",
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.02em",
        tight: "-0.01em",
        normal: "0em",
        wider: "0.03em",
        widest: "0.05em",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".text-h1-hero": {
          "font-family": "var(--font-jakarta), var(--font-inter), sans-serif",
          "font-size": "clamp(2.5rem, 8vw, 6rem)",
          "font-weight": "800",
          "letter-spacing": "-0.02em",
          "line-height": "1",
        },
        ".text-h2-section": {
          "font-family": "var(--font-jakarta), var(--font-inter), sans-serif",
          "font-size": "clamp(1.5rem, 4vw, 2.5rem)",
          "font-weight": "700",
          "letter-spacing": "-0.01em",
          "line-height": "1.1",
        },
        ".text-body-prose": {
          "font-size": "1rem",
          "font-weight": "400",
          "letter-spacing": "0em",
          "line-height": "1.5",
        },
        ".text-label": {
          "font-family": "var(--font-jakarta), var(--font-inter), sans-serif",
          "font-size": "0.75rem",
          "font-weight": "700",
          "letter-spacing": "0.03em",
          "text-transform": "uppercase",
        },
      });
    }),
  ],
};

export default config;
