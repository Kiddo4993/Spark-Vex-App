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
        head: ['var(--font-syne)', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'monospace'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
      },
      colors: {
        spark: {
          DEFAULT: "#00D4FF",
          dim: "rgba(0,212,255,.15)",
          glow: "rgba(0,212,255,.35)",
        },
        amber: {
          DEFAULT: "#FFB340",
          dim: "rgba(255,179,64,.12)",
        },
        success: {
          DEFAULT: "#22E89A",
          dim: "rgba(34,232,154,.12)",
        },
        danger: {
          DEFAULT: "#FF4D6A",
          dim: "rgba(255,77,106,.12)",
        },
        surface: {
          bg: "#080C14",
          card: "#0D1321",
          hover: "#111927",
        },
        line: {
          DEFAULT: "#1C2A3A",
          hi: "#2A3F57",
        },
        txt: {
          1: "#EFF4FA",
          2: "#8FA4BB",
          3: "#4D6275",
        },
      },
      borderRadius: {
        DEFAULT: "10px",
        lg: "16px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
