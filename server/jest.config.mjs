// ESM Jest config. transform:{} disables Babel so Node runs the ES modules
// natively (paired with --experimental-vm-modules in the test script).
export default {
  testEnvironment: 'node',
  transform: {},
  collectCoverageFrom: ['src/**/*.js', '!src/server.js'],
};
