const path = require("path");

module.exports = {
	preset: "react-native",
	transform: {
		"^.+\\.[jt]sx?$": ["babel-jest", { configFile: "./babel.config.cjs" }],
	},
	transformIgnorePatterns: [
		"node_modules/(?!\\.bun/|((jest-)?react-native|@react-native(-community)?|@hyperserve|@testing-library)/)",
	],
	modulePaths: [path.resolve(__dirname, "../../node_modules")],
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
	moduleNameMapper: {
		"^(\\.\\.?/.*)\\.js$": "$1",
		"^@hyperserve/universal-video-uploader$":
			"<rootDir>/../universal-video-uploader/src/index.ts",
	},
	testMatch: ["**/src/__tests__/**/*.test.{ts,tsx}"],
};
