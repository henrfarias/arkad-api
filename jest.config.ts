/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type {Config} from 'jest';

const config: Config = {
  bail: 0,
  cacheDirectory: "/tmp/jest_rs",
  clearMocks: true,
  preset: 'ts-jest',
  collectCoverage: false,
  coveragePathIgnorePatterns: [
    "/node_modules/"
  ],
  fakeTimers: {
    "enableGlobally": false
  },
  maxWorkers: "50%",
  // modulePathIgnorePatterns: [],
  // resetMocks: true,
  restoreMocks: true,
  verbose: true,
  transform: {}
};

export default config;
