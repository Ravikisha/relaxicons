/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    'bin/index.js'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/templates/'
  ],
  coverageReporters: ['text','lcov'],
  moduleFileExtensions: ['js','json'],
};
