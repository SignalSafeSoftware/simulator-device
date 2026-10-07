import { defineConfig } from '@playwright/test';
export default defineConfig({
    testDir: './tests',
    use: {
        // Exercise the production bundle at the same nested path as GitHub Pages.
        baseURL: 'http://127.0.0.1:5191/simulator-device/',
        viewport: { width: 390, height: 844 },
        trace: 'retain-on-failure',
    },
    webServer: {
        command:
            'npm run build && npm run preview -- --port 5191 --strictPort --base=/simulator-device/',
        url: 'http://127.0.0.1:5191/simulator-device/',
        reuseExistingServer: false,
    },
});
