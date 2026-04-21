import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: [
		"@hyperserve/upload",
		"@hyperserve/upload-react",
		"@hyperserve/upload-adapter-hyperserve",
	],
};

export default nextConfig;
