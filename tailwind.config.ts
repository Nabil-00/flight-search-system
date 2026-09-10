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
        white: "#FFFFFF",
        storm: {
          DEFAULT: "#0F282F",
          50: "#F0F5F6",
          100: "#DCE6E8",
          200: "#B8CCD1",
          300: "#8FAFB7",
          400: "#5D8C97",
          500: "#2B5E6B",
          600: "#1E4752",
          700: "#163841",
          800: "#0F282F",
          900: "#0A1A1F",
          950: "#050D10",
        },
        cyan: {
          DEFAULT: "#02EFF0",
          50: "#E6FDFF",
          100: "#C4FAFD",
          200: "#8CF7FB",
          300: "#45EEF7",
          400: "#02EFF0",
          500: "#02D4D5",
          600: "#01A8A9",
          700: "#017F80",
          800: "#015B5C",
          900: "#013B3C",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #0F282F 0%, #02EFF0 100%)",
        "brand-gradient-subtle": "linear-gradient(135deg, rgba(15, 40, 47, 0.95) 0%, rgba(2, 239, 240, 0.15) 100%)",
        "brand-hero-glow": "radial-gradient(ellipse at top, rgba(2, 239, 240, 0.25), transparent 70%)",
      },
      boxShadow: {
        "cyan-glow": "0 0 25px -3px rgba(2, 239, 240, 0.35)",
        "cyan-sm": "0 0 12px -2px rgba(2, 239, 240, 0.25)",
        "storm-card": "0 10px 30px -5px rgba(15, 40, 47, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
