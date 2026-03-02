const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const config = getDefaultConfig(__dirname);

const repoRoot = path.resolve(__dirname, "../..");
const corePackageRoot = path.resolve(
	repoRoot,
	"packages/universal-video-uploader",
);
const nativeUiPackageRoot = path.resolve(
	repoRoot,
	"packages/universal-video-uploader-native",
);

config.watchFolders = [
	corePackageRoot,
	nativeUiPackageRoot,
	path.resolve(repoRoot, "node_modules"),
];

config.resolver.unstable_enableSymlinks = true;

config.resolver.nodeModulesPaths = [
	path.resolve(__dirname, "node_modules"),
];

const singletonModules = {
	react: path.resolve(__dirname, "node_modules/react"),
	"react-native": path.resolve(__dirname, "node_modules/react-native"),
};

config.resolver.extraNodeModules = singletonModules;

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
	const match = singletonModules[moduleName];
	if (match) {
		return { type: "sourceFile", filePath: require.resolve(match) };
	}
	if (originalResolveRequest) {
		return originalResolveRequest(context, moduleName, platform);
	}
	return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
