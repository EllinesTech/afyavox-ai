/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0F1E",
        panel: "#111827",
        border: "#1E2A3A",
        cyan: "#00D4FF",
        purple: "#7B61FF",
        green: "#00FF88",
        red: "#FF3B5C",
        muted: "#8892A4",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
