import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: { dedupe: ['react', 'react-dom'] },
    test: {
        server: { deps: { inline: [/@signalsafe\//] } },
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
        coverage: {
            provider: 'v8',
            include: ['src/**'],
            exclude: ['src/**/*.d.ts'],
            reporter: ['text', 'lcov'],
            reportsDirectory: 'coverage',
        },
    },
});
