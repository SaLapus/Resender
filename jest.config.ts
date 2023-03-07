/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  coveragePathIgnorePatterns: ["\\\\node_modules\\\\"],

  // The glob patterns Jest uses to detect test files
  testMatch: [
    "**/js/**/test/api/*.test.js"
  ],
};
