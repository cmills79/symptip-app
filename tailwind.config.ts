import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#94C7E3', // Soft desaturated blue
          light: '#B5D9EE',
          dark: '#7AB5D9',
        },
        background: {
          DEFAULT: '#F0F8FF', // Very light desaturated blue
          paper: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#A9D18E', // Muted green
          light: '#C5E4AE',
          dark: '#8FBD6F',
        },
        text: {
          primary: '#2C3E50',
          secondary: '#7F8C8D',
          light: '#95A5A6',
        }
      },
      fontFamily: {
        sans: ['PT Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
