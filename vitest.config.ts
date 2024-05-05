/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    clearMocks: true,
    bail: 0,
    exclude: ['node_modules', 'data', 'dist'],
    restoreMocks: true,
    coverage: {
      exclude: ['src/domain/interfaces', '__tests__']
    }
  }
})
