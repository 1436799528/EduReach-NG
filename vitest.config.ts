import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      // Integration tests run against a throwaway database file.
      DATABASE_URL: 'file:storage/itest.db'
    }
  },
  resolve: {
    alias: {
      // Vite (v5) predates node:sqlite — route the builtin through a shim.
      'node:sqlite': fileURLToPath(new URL('./test/shims/node-sqlite.mjs', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
