import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import react from "@astrojs/react";

export default defineConfig({
	integrations: [
		starlight({
			title: "Universal Video Uploader",
			social: [
				{ icon: "github", label: "GitHub", href: "https://github.com/hyper-serve/upload" },
			],
			sidebar: [
				{
					label: "Getting Started",
					items: [
						{ label: "Introduction", slug: "index" },
						{ label: "Installation", slug: "getting-started/installation" },
						{ label: "Quick Start", slug: "getting-started/quick-start" },
					],
				},
				{
					label: "Core Concepts",
					items: [
						{ label: "Upload Provider", slug: "core-concepts/upload-provider" },
						{ label: "Adapters", slug: "core-concepts/adapters" },
						{ label: "File State Machine", slug: "core-concepts/file-state-machine" },
						{ label: "Validation", slug: "core-concepts/validation" },
					],
				},
				{
					label: "Components",
					items: [
						{ label: "DropZone", slug: "components/drop-zone" },
						{ label: "FileList", slug: "components/file-list" },
						{ label: "FileItem", slug: "components/file-item" },
						{ label: "FileListToolbar", slug: "components/file-list-toolbar" },
						{ label: "StatusBadge", slug: "components/status-badge" },
						{ label: "ProgressBar", slug: "components/progress-bar" },
						{ label: "Thumbnail", slug: "components/thumbnail" },
					],
				},
				{
					label: "Guides",
					items: [
						{ label: "Headless Usage", slug: "guides/headless" },
						{ label: "Custom Backend", slug: "guides/custom-backend" },
						{ label: "React Native", slug: "guides/react-native" },
						{ label: "Theming", slug: "guides/theming" },
					],
				},
			],
		}),
		react(),
	],
});
