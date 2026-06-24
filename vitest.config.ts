import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Storage tests mock 'electron' per-file; keep modules isolated.
    isolate: true
  }
})
