import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.js'],
        include: ['src/**/*.test.{jsx,js,tsx,ts}', 'src/**/__tests__/*.{jsx,js,tsx,ts}'],
        exclude: ['src/e2e/**'],
        coverage: {
            provider: 'istanbul',
            include: ['src/**/*.jsx', 'src/**/*.js', 'src/**/*.tsx', 'src/**/*.ts'],
            exclude: [
                'src/**/*.test.jsx', 'src/**/*.test.js', 'src/**/*.test.ts', 'src/**/*.test.tsx',
                'src/**/*.spec.jsx', 'src/**/*.spec.js', 'src/**/*.spec.ts', 'src/**/*.spec.tsx',
                'src/test/**',
            ],
            reporter: ['text', 'html', 'json'],
            reportsDirectory: './coverage',
        },
        mockReset: true,
        clearMocks: true,
    },
});
