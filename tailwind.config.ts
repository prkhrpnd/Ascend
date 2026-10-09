import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        "paper-2": "var(--paper-2)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        vermilion: "var(--vermilion)",
        marigold: "var(--marigold)",
        "ledger-green": "var(--ledger-green)",
        rule: "var(--rule)",
        fintech: {
          blue: "#2563EB",
          "blue-light": "#EFF6FF",
          "blue-dark": "#1D4ED8",
          navy: "#0F172A",
          slate: "#475569",
          border: "#E2E8F0",
          card: "#FFFFFF",
          bg: "#F0F7FF",
        },
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        hand: ["Caveat", "cursive"],
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)",
        "card-hover": "0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
