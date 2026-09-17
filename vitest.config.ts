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
            thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
            include: ['src/**'],
            exclude: ['src/**/*.d.ts'],
            reporter: ['text', 'lcov'],
            reportsDirectory: 'coverage',
        },
    },
});
