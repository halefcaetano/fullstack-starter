// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests-e2e",
  testIgnore: ["**/server/**", "**/node_modules/**"], // ⬅️ ignore backend tests
  timeout: 30_000,
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:5173",
    headless: true,
  },
});
