import { UploadProvider } from "@hyperserve/upload";
import { FileItem } from "@hyperserve/upload-react";
import type React from "react";
import { useMemo } from "react";
import { createMockConfig } from "./MockAdapter";
import { mockFile, mockRef } from "./mockFileState";

const files = [
	mockFile({
		id: "fi-1",
		status: "uploading",
		progress: 55,
		ref: { ...mockRef, name: "vacation-2024.mp4" },
	}),
	mockFile({
		id: "fi-2",
		status: "processing",
		statusDetail: "Transcoding 60%",
		ref: { ...mockRef, name: "interview-raw.mp4" },
	}),
	mockFile({
		id: "fi-3",
		status: "ready",
		playbackUrl: "https://example.com/video.mp4",
		ref: { ...mockRef, name: "product-demo.mp4" },
	}),
	mockFile({
		id: "fi-4",
		status: "failed",
		error: "Upload failed. Check your connection.",
		ref: { ...mockRef, name: "conference-talk.mp4" },
	}),
];

export default function FileItemDemo() {
	const config = useMemo(() => createMockConfig(), []);

	return (
		<UploadProvider config={config}>
			<div
				style={{
					background: "#fff",
					border: "1px solid #e2e8f0",
					borderRadius: 8,
					display: "flex",
					flexDirection: "column",
					gap: "0.75rem",
					padding: "1.5rem",
				}}
			>
				{files.map((file) => (
					<FileItem key={file.id} file={file} layout="row">
						<FileItem.Content />
					</FileItem>
				))}
			</div>
		</UploadProvider>
	);
}
