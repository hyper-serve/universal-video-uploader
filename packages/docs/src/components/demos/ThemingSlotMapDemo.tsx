import { UploadProvider } from "@hyperserve/video-uploader";
import {
	DropZone,
	type DropZoneStyles,
	FileItem,
	type FileItemStyles,
	FileList,
} from "@hyperserve/video-uploader-react";
import type React from "react";
import { useMemo } from "react";
import { createMockConfig } from "./MockAdapter";

const darkTheme = {
	dropZone: {
		activeRoot: { borderColor: "#818cf8", borderStyle: "solid" },
		browseText: { color: "#818cf8" },
		primaryText: { color: "#f1f5f9" },
		root: { background: "#1e293b", border: "1px dashed #334155" },
	} satisfies DropZoneStyles,
	fileItem: {
		errorMessage: { color: "#f87171" },
		fileName: { color: "#f1f5f9" },
		fileSize: { color: "#64748b" },
		progressFill: { background: "linear-gradient(90deg, #818cf8, #a78bfa)" },
		removeButton: { color: "#64748b" },
		retryButton: { color: "#fb923c" },
		root: { background: "#1e293b", border: "1px solid #334155" },
		statusIcon: { color: "#818cf8" },
	} satisfies FileItemStyles,
};

function UploadUI() {
	return (
		<div style={wrap}>
			<DropZone styles={darkTheme.dropZone} supportingText="MP4 only" />
			<FileList>
				{(file) => (
					<FileItem
						file={file}
						key={file.id}
						layout="row"
						styles={darkTheme.fileItem}
					>
						<FileItem.Content />
					</FileItem>
				)}
			</FileList>
		</div>
	);
}

export default function ThemingSlotMapDemo() {
	const config = useMemo(() => createMockConfig(), []);
	return (
		<div className="not-content" style={container}>
			<UploadProvider config={config}>
				<UploadUI />
			</UploadProvider>
		</div>
	);
}

const container: React.CSSProperties = {
	background: "#0f172a",
	border: "1px solid #1e293b",
	borderRadius: 8,
	padding: "1.5rem",
};

const wrap: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "1rem",
};
