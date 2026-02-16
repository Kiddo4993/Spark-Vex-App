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
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        vex: {
          red: "#DA291C", // Official VEX Red
          blue: "#0066B3", // Official VEX Blue (pantone 300)
          dark: "#111111", // Deep background
          darker: "#0A0A0A", // Card background
          surface: "#1A1A1A", // Surface/Card
          border: "#333333",
          accent: "#A8DADC", // Keep potential accent or switch to cyan
          text: "#FFFFFF",
          muted: "#A1A1AA",
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'vex-gradient': 'linear-gradient(135deg, #111111 0%, #1A1A1A 100%)',
      },
    },
  },
  plugins: [],
};
export default config;
