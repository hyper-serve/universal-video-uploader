import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
		  "@hyper-serve/upload-react": path.resolve(__dirname, "../../packages/react/src"),
		  "@hyper-serve/upload": path.resolve(__dirname, "../../packages/core/src"),
		},
	},
});
