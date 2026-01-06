import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class", ".dark"],

  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },

        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
    },
  },

  plugins: [require("tailwindcss-animate")],
}

export default config
