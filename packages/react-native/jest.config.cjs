const path = require("node:path");

module.exports = {
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
	moduleNameMapper: {
		"^(\\.\\.?/.*)\\.js$": "$1",
		"^@hyper-serve/upload$": "<rootDir>/../core/src/index.ts",
	},
	modulePaths: [path.resolve(__dirname, "../../node_modules")],
	preset: "react-native",
	testMatch: ["**/src/__tests__/**/*.test.{ts,tsx}"],
	transform: {
		"^.+\\.[jt]sx?$": ["babel-jest", { configFile: "./babel.config.cjs" }],
	},
	transformIgnorePatterns: [
		"node_modules/(?!\\.bun/|((jest-)?react-native|@react-native(-community)?|@hyper-serve|@testing-library)/)",
	],
};
