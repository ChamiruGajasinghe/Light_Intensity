/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: "#4A90E2",
          green: "#50C878",
          yellow: "#FFD700",
          red: "#FF6B6B",
          purple: "#9D4EDD",
        },
        bg: {
          light: "#F5F7FA",
          dark: "#1A1D2E",
        },
        card: {
          light: "#FFFFFF",
          dark: "#252B42",
        },
        text: {
          light: "#2C3E50",
          dark: "#ECF0F1",
        },
        sidebar: {
          light: "#FFFFFF",
          dark: "#16213E",
        },
      },
      boxShadow: {
        custom: "0 4px 15px rgba(0, 0, 0, 0.1)",
      },
      animation: {
        pulse: "pulse 2s infinite",
        blink: "blink 1.5s infinite",
        "pulse-alert": "pulse-alert 1.5s infinite",
        spin: "spin 1s linear infinite",
        slideIn: "slideIn 0.3s ease",
      },
      keyframes: {
        pulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        "pulse-alert": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
        slideIn: {
          from: {
            opacity: "0",
            transform: "translateX(-10px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
      },
    },
  },
  plugins: [],
};
