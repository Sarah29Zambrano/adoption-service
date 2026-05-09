module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['services/index.js', 'routers/adoption.router.js'],
  coverageThreshold: {
    global: { branches: 85, functions: 100, lines: 90, statements: 90 },
  },
  coverageReporters: ['text', 'lcov'],
  verbose: true,
};