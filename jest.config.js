/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  coveragePathIgnorePatterns: ["\\\\node_modules\\\\"],

  // The glob patterns Jest uses to detect test files
  testMatch: ["**/test/**/*.test.ts"],
};
