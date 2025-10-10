// FILE: server/jest.config.js
/** @type {import('jest').Config} */
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/index.ts"],
  coverageDirectory: "coverage",
  verbose: true,
  testTimeout: 10000,
};

// Commit message: chore(test): add Jest configuration for ESM TypeScript
// PR title: chore: Configure Jest for TypeScript ESM testing
// Notes: Configures Jest with ts-jest for ESM modules. Sets 10s timeout for integration tests. Excludes index.ts from coverage. Use NODE_OPTIONS=--experimental-vm-modules when running jest.
