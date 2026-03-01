const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const config = getDefaultConfig(__dirname);

const repoRoot = path.resolve(__dirname, "../..");
const packageRoot = path.resolve(repoRoot, "packages/universal-video-uploader");

config.watchFolders = [packageRoot, path.resolve(repoRoot, "node_modules")];

config.resolver.unstable_enableSymlinks = true;

config.resolver.nodeModulesPaths = [
	path.resolve(__dirname, "node_modules"),
];

config.resolver.extraNodeModules = {
	react: path.resolve(__dirname, "node_modules/react"),
	"react-native": path.resolve(__dirname, "node_modules/react-native"),
};

module.exports = config;
