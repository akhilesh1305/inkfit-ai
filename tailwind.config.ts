import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          bg: "#0A0A0A",
          surface: "#111827",
          muted: "#A1A1AA",
          border: "rgba(255,255,255,0.08)",
        },
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
          950: "#2E1065",
        },
        accent: {
          cyan: "#06B6D4",
          blue: "#3B82F6",
        },
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          raised: "rgb(var(--surface-raised) / <alpha-value>)",
          muted: "rgb(var(--surface-muted) / <alpha-value>)",
        },
        content: {
          DEFAULT: "rgb(var(--content) / <alpha-value>)",
          muted: "rgb(var(--content-muted) / <alpha-value>)",
          subtle: "rgb(var(--content-subtle) / <alpha-value>)",
        },
        line: "rgb(var(--line) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "hero": ["4rem", { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "800" }],
        "section": ["2.5rem", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "700" }],
        "body-lg": ["1.125rem", { lineHeight: "1.7" }],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(124, 58, 237, 0.45)",
        "glow-lg": "0 0 60px -12px rgba(124, 58, 237, 0.55)",
        "glow-blue": "0 0 40px -8px rgba(59, 130, 246, 0.4)",
        card: "0 4px 24px rgba(0, 0, 0, 0.25)",
        "card-hover": "0 16px 48px rgba(124, 58, 237, 0.18)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #7C3AED 0%, #3B82F6 50%, #06B6D4 100%)",
        "gradient-text": "linear-gradient(135deg, #7C3AED 0%, #3B82F6 50%, #06B6D4 100%)",
        "gradient-radial": "radial-gradient(ellipse at center, var(--tw-gradient-stops))",
      },
      animation: {
        "mesh-shift": "mesh-shift 20s ease infinite",
        "glow-pulse": "glow-pulse 6s ease-in-out infinite",
      },
      keyframes: {
        "mesh-shift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(2%, -2%) scale(1.02)" },
          "66%": { transform: "translate(-1%, 2%) scale(0.98)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
