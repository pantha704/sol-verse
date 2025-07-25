import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  base: "/", // Important for Vercel deployment
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
  server: {
    // For local development
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
