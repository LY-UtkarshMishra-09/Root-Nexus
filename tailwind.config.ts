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
        jiit: {
          blue: "#1e3a8a",
          gold: "#f59e0b",
        },
      },
      boxShadow: {
        "glass-sm": "0 2px 10px -2px rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)",
        "glass-md": "0 8px 24px -4px rgba(0, 0, 0, 0.3), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)",
        "glass-lg": "0 16px 36px -6px rgba(0, 0, 0, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)",
        "light-glass": "0 10px 30px 0 rgba(31, 38, 135, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)",
      },
      backgroundImage: {
        "liquid-radial": "radial-gradient(circle at 50% 0%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
