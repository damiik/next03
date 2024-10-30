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
        background: "var(--background)",
        foreground: "var(--foreground)",
        BLACK: "#000000",
        WHITE: "#ffffff",
        RED: "#9a0000",
        CYAN: "#a590e8",
        PURPLE: "#b472d0",
        GREEN: "#9fe339",
        BLUE: "#352879",
        YELLOW: "#fff780",
        ORANGE: "#d49a44",
        BROWN: "#433900",
        PINKY_LIGHT_RED: "#f6ab96",
        DARK_GREY: "#656565",
        MID_GREY: "#b1b1b1",
        LIGHT_GREEN: "#e4ffb5",
        SKY_LIGHT_BLUE: "#a9f3fe",
        LIGHT_GREY: "#d8e4e4",
      },
    },
  },
  plugins: [],
};
export default config;
