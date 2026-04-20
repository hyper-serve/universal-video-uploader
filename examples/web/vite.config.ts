import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
		  "@hyperserve/upload-react": path.resolve(__dirname, "../../packages/react/src"),
		  "@hyperserve/upload": path.resolve(__dirname, "../../packages/core/src"),
		},
	},
});
