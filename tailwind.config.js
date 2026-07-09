/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gazette: {
          paper: "#F6F3EC",
          ink: "#1E2A38",     // deep slate-navy, ledger-book feel
          rule: "#C9BFA8",    // hairline rule color
          seal: "#B4622B",    // muted marigold/seal accent (not the Claude terracotta)
          moss: "#3E5C4E",    // secondary accent, correct-answer green-ish
          alert: "#A23B3B",
        },
      },
      fontFamily: {
        display: ["'Source Serif 4'", "Georgia", "serif"],
        body: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
