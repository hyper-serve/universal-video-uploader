import { FileList } from "@hyperserve/upload-react";
import type React from "react";
import { mockFile, mockRef } from "./mockFileState";
import { MockFilesProvider } from "./MockFilesProvider";

const mockFiles = [
	mockFile({
		id: "fl-1",
		status: "uploading",
		progress: 55,
		ref: { ...mockRef, name: "vacation-2024.mp4" },
	}),
	mockFile({
		id: "fl-2",
		status: "processing",
		statusDetail: "Transcoding 60%",
		ref: { ...mockRef, name: "interview-raw.mp4" },
	}),
	mockFile({
		id: "fl-3",
		status: "ready",
		playbackUrl: "https://example.com/video.mp4",
		ref: { ...mockRef, name: "product-demo.mp4" },
	}),
	mockFile({
		id: "fl-4",
		status: "failed",
		error: "Upload failed. Check your connection.",
		ref: { ...mockRef, name: "conference-talk.mp4" },
	}),
];

const sectionLabel: React.CSSProperties = {
	color: "#64748b",
	fontSize: "0.75rem",
	fontWeight: 600,
	letterSpacing: "0.05em",
	textTransform: "uppercase",
};

export default function FileListDemo() {
	return (
		<MockFilesProvider files={mockFiles}>
			<div
				style={{
					background: "#fff",
					border: "1px solid #e2e8f0",
					borderRadius: 8,
					display: "flex",
					flexDirection: "column",
					gap: "1.5rem",
					padding: "1.5rem",
				}}
			>
				<div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
					<span style={sectionLabel}>List mode</span>
					<FileList mode="list" />
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
					<span style={sectionLabel}>Grid mode</span>
					<FileList mode="grid" />
				</div>
			</div>
		</MockFilesProvider>
	);
}
