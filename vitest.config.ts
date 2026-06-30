import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
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
