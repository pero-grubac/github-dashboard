import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/github-dashboard/",
  plugins: [react()],
  server: {
    host: true,
  },
  css: {
    devSourcemap: false,
  },
});