export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        saathi: {
          green: "#3f9674",
          greenDark: "#2f7f62",
          mint: "#e8f5ee",
          mintSoft: "#f3fbf7",
          ink: "#343143",
          muted: "#85899a",
          line: "#e7ece8",
          amber: "#f7b331",
          red: "#ef5543",
          blue: "#8ccdf7",
          indigo: "#6366f1",
          indigoDark: "#4f46e5",
          indigoMint: "#eef2ff",
          violet: "#8b5cf6",
          cyan: "#06b6d4"
        }
      },
      boxShadow: {
        saathi: "0 8px 20px rgba(41, 126, 93, 0.16)",
        card: "0 5px 18px rgba(44, 65, 52, 0.08)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};
