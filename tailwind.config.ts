import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "#faf8ff",
        primary: {
          DEFAULT: "#1D4ED8",
          foreground: "#ffffff",
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#1D4ED8",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        secondary: {
          DEFAULT: "#059669",
          foreground: "#ffffff",
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        tertiary: {
          DEFAULT: "#D97706",
          foreground: "#ffffff",
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#D97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        neutral: {
          DEFAULT: "#0F172A",
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0F172A",
          950: "#020617",
        },
        status: {
          lost: {
            bg: "#FEE2E2",
            text: "#991B1B",
            border: "#FCA5A5",
          },
          found: {
            bg: "#DCFCE7",
            text: "#166534",
            border: "#86EFAC",
          },
          match: {
            high: {
              bg: "#FEF3C7",
              text: "#92400E",
              border: "#FCD34D",
            },
            medium: {
              bg: "#E0E7FF",
              text: "#3730A3",
              border: "#A5B4FC",
            },
            low: {
              bg: "#F1F5F9",
              text: "#475569",
              border: "#CBD5E1",
            },
          },
          claim: {
            pending: {
              bg: "#FEF9C3",
              text: "#854D0E",
            },
            under_review: {
              bg: "#DBEAFE",
              text: "#1E40AF",
            },
            approved: {
              bg: "#DCFCE7",
              text: "#15803D",
            },
            rejected: {
              bg: "#FEE2E2",
              text: "#B91C1C",
            },
            resolved: {
              bg: "#F3E8FF",
              text: "#6B21A8",
            },
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        heading: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
