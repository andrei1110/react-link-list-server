module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: [
    "**/*.(t|j)s",
    "!**/*.module.ts",
    "!main.ts",
    "!**/migrations/**",
  ],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  moduleNameMapping: {
    "^src/(.*)$": "<rootDir>/$1",
  },
};
