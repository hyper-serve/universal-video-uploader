import React, { useMemo } from "react";
import { UploadProvider } from "@hyperserve/upload";
import {
	DropZone,
	FileList,
	FileListToolbar,
	ViewModeProvider,
} from "@hyperserve/upload-react";
import { createMockConfig } from "./MockAdapter";

function UploadUI() {
	return (
		<div style={wrap}>
			<DropZone supportingText="Simulated upload — real uploads transcode to browser-compatible formats" />
			<FileListToolbar right={<FileListToolbar.ViewToggle />} />
			<FileList emptyMessage="Drop or browse files to see it in action." />
		</div>
	);
}

export default function DefaultDemo() {
	const config = useMemo(() => createMockConfig(), []);

	return (
		<div style={container}>
			<UploadProvider config={config}>
				<ViewModeProvider>
					<UploadUI />
				</ViewModeProvider>
			</UploadProvider>
		</div>
	);
}

const container: React.CSSProperties = {
	border: "1px solid var(--sl-color-gray-5)",
	borderRadius: 8,
	padding: "1.5rem",
	background: "var(--sl-color-bg)",
};

const wrap: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "1rem",
};
