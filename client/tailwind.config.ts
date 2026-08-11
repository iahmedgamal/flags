import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        atlas: {
          bg: "#0a0e1a",
          card: "rgba(255, 255, 255, 0.03)",
          gold: "#d9a94e",
          "gold-dim": "rgba(217, 169, 78, 0.5)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
