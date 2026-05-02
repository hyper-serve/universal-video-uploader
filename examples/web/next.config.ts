import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: [
		"@hyperserve/video-uploader",
		"@hyperserve/video-uploader-react",
		"@hyperserve/video-uploader-adapter-hyperserve",
	],
};

export default nextConfig;
