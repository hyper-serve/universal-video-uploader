import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

export default defineConfig({
	integrations: [
		starlight({
			components: {
				// ThemeProvider: "./src/components/ThemeProvider.astro",
				ThemeSelect: "./src/components/ThemeSelect.astro",
			},
			customCss: ["./src/styles/custom.css"],
			sidebar: [
				{
					items: [
						{ label: "Introduction", slug: "index" },
						{ label: "Installation", slug: "getting-started/installation" },
						{ label: "Quick Start", slug: "getting-started/quick-start" },
					],
					label: "Getting Started",
				},
				{
					items: [
						{ label: "Upload Provider", slug: "core-concepts/upload-provider" },
						{ label: "Adapters", slug: "core-concepts/adapters" },
						{
							label: "File State Machine",
							slug: "core-concepts/file-state-machine",
						},
						{ label: "Validation", slug: "core-concepts/validation" },
					],
					label: "Core Concepts",
				},
				{
					items: [
						{ label: "DropZone", slug: "components/drop-zone" },
						{ label: "FileList", slug: "components/file-list" },
						{ label: "FileItem", slug: "components/file-item" },
						{ label: "FileListToolbar", slug: "components/file-list-toolbar" },
						{ label: "StatusBadge", slug: "components/status-badge" },
						{ label: "ProgressBar", slug: "components/progress-bar" },
						{ label: "Thumbnail", slug: "components/thumbnail" },
					],
					label: "Components",
				},
				{
					items: [
						{ label: "Headless Usage", slug: "guides/headless" },
						{ label: "Custom Backend", slug: "guides/custom-backend" },
						{ label: "React Native", slug: "guides/react-native" },
						{ label: "Theming", slug: "guides/theming" },
					],
					label: "Guides",
				},
			],
			social: [
				{
					href: "https://github.com/hyper-serve/upload",
					icon: "github",
					label: "GitHub",
				},
			],
			title: "Universal Video Uploader",
		}),
		react(),
	],
});
