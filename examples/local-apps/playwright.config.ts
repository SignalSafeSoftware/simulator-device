import { defineConfig } from '@playwright/test';
export default defineConfig({
    testDir: './tests',
    use: {
        baseURL: 'http://127.0.0.1:5191',
        viewport: { width: 390, height: 844 },
        trace: 'retain-on-failure',
    },
    webServer: {
        command: 'npm run dev -- --port 5191',
        url: 'http://127.0.0.1:5191',
        reuseExistingServer: false,
    },
});
