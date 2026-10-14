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
};
