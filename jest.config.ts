/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest'

const config: Config = {
  bail: 0,
  cacheDirectory: '/tmp/jest_rs',
  clearMocks: true,
  preset: 'ts-jest/presets/default-esm',
  collectCoverage: false,
  coveragePathIgnorePatterns: ['/node_modules/'],
  fakeTimers: {
    enableGlobally: false
  },
  maxWorkers: '50%',
  // modulePathIgnorePatterns: [],
  // resetMocks: true,
  restoreMocks: true,
  verbose: true,
  testEnvironment: 'node',
  transform: {},
  rootDir: '.',
  modulePaths: ['<rootDir>']
}

export default config
