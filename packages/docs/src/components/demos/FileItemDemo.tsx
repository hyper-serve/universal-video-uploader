import { UploadProvider } from "@hyperserve/upload";
import { FileItem } from "@hyperserve/upload-react";
import { useMemo } from "react";
import { createMockConfig } from "./MockAdapter";
import { mockFile, mockRef } from "./mockFileState";

const files = [
	mockFile({
		id: "fi-1",
		progress: 55,
		ref: { ...mockRef, name: "vacation-2024.mp4" },
		status: "uploading",
	}),
	mockFile({
		id: "fi-2",
		ref: { ...mockRef, name: "interview-raw.mp4" },
		status: "processing",
		statusDetail: "Transcoding 60%",
	}),
	mockFile({
		id: "fi-3",
		playbackUrl: "https://example.com/video.mp4",
		ref: { ...mockRef, name: "product-demo.mp4" },
		status: "ready",
	}),
	mockFile({
		error: "Upload failed. Check your connection.",
		id: "fi-4",
		ref: { ...mockRef, name: "conference-talk.mp4" },
		status: "failed",
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
					<FileItem file={file} key={file.id} layout="row">
						<FileItem.Content />
					</FileItem>
				))}
			</div>
		</UploadProvider>
	);
}
