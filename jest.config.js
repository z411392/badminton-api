module.exports = {
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)": "<rootDir>/lib/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/lib/tests/setup.ts"],
  testMatch: ["<rootDir>/lib/tests/**/*.test.ts"],
  testTimeout: 20000,
}
