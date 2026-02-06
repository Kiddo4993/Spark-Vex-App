import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        vex: {
          red: "#E63946",
          blue: "#457B9D",
          dark: "#1D3557",
          darker: "#0D1B2A",
          accent: "#A8DADC",
        },
      },
    },
  },
  plugins: [],
};
export default config;
