import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_FRONTEND_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },
});
