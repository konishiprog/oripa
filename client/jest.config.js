const preset = require('jest-preset-angular/jest-preset');

module.exports = {
  ...preset,
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/main.ts',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/setup-jest.ts',
  ],
};
