// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, testIgnore: /extensao/ },
    { name: 'celular', use: { ...devices['Pixel 7'] }, testIgnore: /extensao/ },
    // Carrega a extensão de verdade num Chromium com perfil próprio (ver tests/extensao.spec.js).
    { name: 'extensao', testMatch: /extensao/ },
  ],
  webServer: {
    command: 'npx http-server . -p 4173 -s -c-1',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});
