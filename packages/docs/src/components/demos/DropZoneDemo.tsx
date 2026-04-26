import { UploadProvider, useUpload } from "@hyperserve/upload";
import { DropZone } from "@hyperserve/upload-react";
import type React from "react";
import { useMemo } from "react";
import { createMockConfig } from "./MockAdapter";

function QueuedCount() {
	const { files } = useUpload();
	if (files.length === 0) return null;
	return (
		<p
			style={{
				color: "#64748b",
				fontSize: "0.875rem",
				margin: 0,
				textAlign: "center",
			}}
		>
			{files.length} file{files.length !== 1 ? "s" : ""} queued
		</p>
	);
}

export default function DropZoneDemo() {
	const config = useMemo(() => createMockConfig(), []);
	return (
		<div
			style={{
				background: "#fff",
				border: "1px solid #e2e8f0",
				borderRadius: 8,
				display: "flex",
				flexDirection: "column",
				gap: "1rem",
				padding: "1.5rem",
			}}
		>
			<UploadProvider config={config}>
				<DropZone supportingText="MP4, WebM, MOV — up to 500 MB" />
				<QueuedCount />
			</UploadProvider>
		</div>
	);
}
