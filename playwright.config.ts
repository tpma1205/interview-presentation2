import { defineConfig } from '@playwright/test';

// 本機使用系統 Edge，CI 使用 Playwright 內建 Chromium
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    channel: process.env.CI ? undefined : 'msedge',
    viewport: { width: 1366, height: 768 },
  },
});
