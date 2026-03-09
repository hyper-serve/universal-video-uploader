import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
		  "@hyperserve/universal-video-uploader-react": path.resolve(__dirname, "../../packages/universal-video-uploader-react/src"),
		  "@hyperserve/universal-video-uploader": path.resolve(__dirname, "../../packages/universal-video-uploader/src"),
		},
	},
});
