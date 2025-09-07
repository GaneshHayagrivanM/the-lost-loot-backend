/** @type {import('jest').Config} */
const config = {
  // Use 'node' as the test environment, which is suitable for backend testing.
  testEnvironment: 'node',

  // Automatically clear mock calls, instances, and results before every test.
  clearMocks: true,

  // The directory where Jest should output its coverage files.
  coverageDirectory: 'coverage',

  // The glob patterns Jest uses to detect test files.
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js',
  ],

  // Indicates whether each individual test should be reported during the run.
  verbose: true,
};

module.exports = config;
