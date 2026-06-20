import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0f172a",   // slate-900 — page background
          card:    "#1e293b",   // slate-800 — card surfaces
          raised:  "#334155",   // slate-700 — elevated cards / input bg
          border:  "#475569",   // slate-600 — borders
        },
        brand: {
          DEFAULT: "#3b82f6",   // blue-500
          hover:   "#2563eb",   // blue-600
          muted:   "#1d4ed8",   // blue-700
        },
        success: {
          DEFAULT: "#22c55e",   // green-500
          hover:   "#16a34a",   // green-600
        },
        danger: {
          DEFAULT: "#ef4444",   // red-500
          hover:   "#dc2626",   // red-600
        },
        warn: {
          DEFAULT: "#f59e0b",   // amber-500
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
      },
      keyframes: {
        fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
export default config;
