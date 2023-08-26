/** @type {import('ts-jest').JestConfigWithTsJest}
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
};
 */

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  forceExit: true,
  resetMocks: true,
  restoreMocks: true,
  // clearMocks: true,
  coverageProvider: "v8",
  moduleFileExtensions: ["js", "ts", "json", "node"],

  roots: ["<rootDir>/src"],

  testMatch: ["**/**/*.test.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
};
