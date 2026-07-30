import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./src/tests/e2e",

  timeout: 120_000,

  expect: {
    timeout: 60_000,
  },

  use: {
    baseURL: "http://localhost:3000",
    headless: false,
  },

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120000,
  },

  globalSetup: "./src/tests/e2e/setup.ts",
})