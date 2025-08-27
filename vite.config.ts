import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: "/", // ✅ Required for proper routing on Vercel

  build: {
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
    },
  },

  server: {
    host: "::",
    port: 8080,
  },

  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // ✅ Add this line for .worker.js support in Vite
  assetsInclude: ["**/*.worker.js"],
}));
