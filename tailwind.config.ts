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
        canvas: "#0E1111",
        shell: "#090B0B",
        panel: "#171B1A",
        "panel-raised": "#202725",
        ink: "#F2F5F3",
        muted: "#AAB4AF",
        line: "#333D39",
        accent: "#C08457",
        info: "#5EEAD4",
        warning: "#FACC15",
        danger: "#F87171",
        success: "#4ADE80",
        sand: "#202725",
      },
      boxShadow: {
        panel: "0 18px 48px rgba(0, 0, 0, 0.32)",
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
