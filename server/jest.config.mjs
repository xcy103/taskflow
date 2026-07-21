// ESM Jest config. transform:{} disables Babel so Node runs the ES modules
// natively (paired with --experimental-vm-modules in the test script).
export default {
  testEnvironment: 'node',
  transform: {},
  collectCoverageFrom: ['src/**/*.js', '!src/server.js'],
  // Floor that CI enforces (npm run test:coverage). Kept just under current
  // numbers so it locks in coverage without being brittle.
  coverageThreshold: {
    global: { statements: 85, branches: 65, functions: 85, lines: 85 },
  },
};
