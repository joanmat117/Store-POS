/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    environment: 'node',
    include: ['server/test/unit/services/**/*.test.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'server/test/**',
        '**/*.d.ts',
        'server/**/*.test.ts',
        'server/dev-server.ts',
        'server/standalone.ts'
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70
      }
    },
    setupFiles: ['server/test/setup.ts'],
    alias: {
      '@': path.resolve(__dirname, './server')
    }
  }
})