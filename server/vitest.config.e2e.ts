/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'node',
    include: [path.join(__dirname, 'test/e2e/**/*.test.ts')],
    setupFiles: [path.join(__dirname, 'test/e2e/setup.ts')],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    pool: 'forks',
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: path.join(__dirname, 'test-results/coverage-e2e'),
      include: [path.join(__dirname, '**/*.ts')],
      exclude: [
        path.join(__dirname, 'test/**'),
        path.join(__dirname, 'dev.mjs'),
        path.join(__dirname, 'dist/**'),
        path.join(__dirname, 'vitest.config*.ts'),
      ],
    },
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
    sequence: { hooks: 'list' },
  },
});