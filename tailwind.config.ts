import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      black: "#000000",
      white: "#FFFFFF",
      transparent: "transparent",
      "bg-primary": "#FFFFFF",
      "ink-primary": "#000000",
      "surface-muted": "#F4F4F4",
      alert: "#FF0000",
    },
    borderRadius: {
      none: "0px",
    },
    boxShadow: {
      none: "0 0 #0000",
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "Courier New", "monospace"],
        serif: ["var(--font-serveroff)", "Georgia", "serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.02em",
        tight: "-0.01em",
        normal: "0em",
        widest: "0.05em",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".text-h1-hero": {
          "font-size": "clamp(2.5rem, 8vw, 5rem)",
          "font-weight": "700",
          "letter-spacing": "-0.02em",
          "line-height": "1",
        },
        ".text-h2-section": {
          "font-size": "clamp(1.5rem, 4vw, 2.5rem)",
          "font-weight": "600",
          "letter-spacing": "-0.01em",
          "line-height": "1.1",
        },
        ".text-body-prose": {
          "font-size": "1rem",
          "font-weight": "400",
          "letter-spacing": "0em",
          "line-height": "1.6",
        },
        ".text-tech-data": {
          "font-family":
            "var(--font-jetbrains-mono), Courier New, monospace",
          "font-size": "0.75rem",
          "font-weight": "400",
          "letter-spacing": "0.05em",
          "text-transform": "uppercase",
        },
      });
    }),
  ],
};

export default config;
