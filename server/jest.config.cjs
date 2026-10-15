module.exports = {
  testEnvironment: "node",

  testMatch: ["<rootDir>/tests/**/*.test.ts"],

  transform: {
    "^.+\\.tsx?$": [
      "babel-jest",
      {
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          "@babel/preset-typescript",
        ],
      },
    ],
  },

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/server.ts",
    "!src/prisma/seed.ts",
  ],

  coverageDirectory: "../coverage/server",

  coverageReporters: ["text", "html"],
};
