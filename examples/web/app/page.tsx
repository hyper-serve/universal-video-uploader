"use client";

import { useMemo } from "react";
import { createHyperserveConfig } from "@hyperserve/upload-adapter-hyperserve";
import { UploadProvider, allowedTypes, composeValidators, maxFileSize } from "@hyperserve/upload";
import { DropZone, FileList, FileListToolbar, ViewModeProvider } from "@hyperserve/upload-react";

function makeConfig() {
	return createHyperserveConfig({
		createUpload: (file, options) =>
			fetch("/api/create-upload", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ filename: file.name, fileSizeBytes: file.size, ...options }),
			}).then((r) => r.json()),
		completeUpload: async (videoId) => {
			await fetch(`/api/complete-upload/${videoId}`, { method: "POST" });
		},
		getVideoStatus: (videoId) =>
			fetch(`/api/video-status/${videoId}`).then((r) => r.json()),
		uploadOptions: { isPublic: true, resolutions: ["480p", "1080p"] },
		validate: composeValidators(
			maxFileSize(500 * 1024 * 1024),
			allowedTypes(["video/*"]),
		),
	});
}

export default function Page() {
	const config = useMemo(() => makeConfig(), []);

	return (
		<main style={styles.main}>
			<div style={styles.container}>
				<h1 style={styles.title}>Video Upload</h1>
				<p style={styles.subtitle}>
					Upload videos to Hyperserve for transcoding and streaming.
				</p>
				<UploadProvider config={config}>
					<ViewModeProvider>
						<DropZone supportingText="MP4, WebM, MOV — up to 500 MB" />
						<FileListToolbar right={<FileListToolbar.ViewToggle />} />
						<FileList emptyMessage="Drop or browse files to begin." />
					</ViewModeProvider>
				</UploadProvider>
			</div>
		</main>
	);
}

const styles = {
	main: { minHeight: "100vh", padding: "2rem 1rem" },
	container: { margin: "0 auto", maxWidth: 720 },
	title: { fontSize: "1.75rem", fontWeight: 700, margin: "0 0 0.5rem" },
	subtitle: { color: "#64748b", margin: "0 0 2rem" },
} satisfies Record<string, React.CSSProperties>;
