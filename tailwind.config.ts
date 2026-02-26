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
        body: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        alliance: {
          red: {
            DEFAULT: "#E83333",
            dim: "rgba(232, 51, 51, 0.15)",
          },
          blue: {
            DEFAULT: "#3366EE",
            dim: "rgba(51, 102, 238, 0.15)",
          }
        },
        gold: {
          DEFAULT: "#3366EE", // Blue
          dim: "rgba(51, 102, 238, 0.15)",
        },
        amber: {
          DEFAULT: "#E83333", // Red
          dim: "rgba(232, 51, 51, 0.15)",
        },
        success: {
          DEFAULT: "#3366EE", // Strong blue
          dim: "rgba(51, 102, 238, 0.15)",
        },
        danger: {
          DEFAULT: "#E83333", // Red
          dim: "rgba(232, 51, 51, 0.15)",
        },
        surface: {
          bg: "#09080C",
          card: "#111018",
          hover: "#181722",
        },
        line: {
          DEFAULT: "#23222F",
          hi: "#3A3849",
        },
        txt: {
          1: "#F4F2F0",     // Warm off-white
          2: "#BABCC3",     // Cooler light gray
          3: "#8A8E9A",     // Cool medium gray
        },
      },
      borderRadius: {
        DEFAULT: "6px",
        lg: "10px",
      },
    },
  },
  plugins: [],
};
export default config;
