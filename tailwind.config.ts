import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f5f1ea",
        ink: "#18212d",
        line: "#d5d2ca",
        accent: "#0f766e",
        sand: "#ede6d8",
      },
      boxShadow: {
        panel: "0 16px 40px rgba(24, 33, 45, 0.08)",
      },
      fontFamily: {
        sans: ["var(--font-manrope)"],
        mono: ["var(--font-ibm-plex-mono)"],
      },
    },
  },
  plugins: [],
};

export default config;
