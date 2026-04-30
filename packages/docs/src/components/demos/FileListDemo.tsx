import { FileList } from "@hyperserve/upload-react";
import type React from "react";
import { MockFilesProvider } from "./MockFilesProvider";
import { mockFile, mockRef } from "./mockFileState";

const THUMB_SVG =
	"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='90'%3E%3Crect width='160' height='90' fill='%23cbd5e1'/%3E%3Ctext x='80' y='48' text-anchor='middle' dominant-baseline='middle' fill='%2394a3b8' font-size='11' font-family='sans-serif'%3Eproduct-demo.mp4%3C/text%3E%3C/svg%3E";

const mockFiles = [
	mockFile({
		id: "fl-1",
		progress: 55,
		ref: { ...mockRef, name: "vacation-2024.mp4" },
		status: "uploading",
	}),
	mockFile({
		id: "fl-2",
		ref: { ...mockRef, name: "interview-raw.mp4" },
		status: "processing",
		statusDetail: "Transcoding 60%",
	}),
	mockFile({
		id: "fl-3",
		ref: { ...mockRef, name: "product-demo.mp4" },
		status: "ready",
		thumbnailUri: THUMB_SVG,
	}),
	mockFile({
		error: "Upload failed. Check your connection.",
		id: "fl-4",
		ref: { ...mockRef, name: "conference-talk.mp4" },
		status: "failed",
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
				className="not-content"
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
				<div
					style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
				>
					<span style={sectionLabel}>List mode</span>
					<FileList mode="list" />
				</div>
				<div
					style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
				>
					<span style={sectionLabel}>Grid mode</span>
					<FileList mode="grid" />
				</div>
			</div>
		</MockFilesProvider>
	);
}
