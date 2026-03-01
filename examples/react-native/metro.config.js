const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const config = getDefaultConfig(__dirname);

const packageRoot = path.resolve(__dirname, "../../packages/universal-video-uploader");

config.watchFolders = [packageRoot];

config.resolver.nodeModulesPaths = [
	path.resolve(__dirname, "node_modules"),
];

config.resolver.extraNodeModules = {
	react: path.resolve(__dirname, "node_modules/react"),
	"react-native": path.resolve(__dirname, "node_modules/react-native"),
};

module.exports = config;
