import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    // Playwright vive en e2e/, corre con su propio runner
    exclude: ["node_modules", ".next", "e2e"],
  },
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
});
