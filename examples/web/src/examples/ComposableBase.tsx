import React from "react";
import { UploadProvider } from "@hyperserve/upload";
import {
	DropZone,
	FileList,
	FileListToolbar,
	ViewModeProvider,
} from "@hyperserve/upload-react";
import { demoConfig } from "../shared";

function UploadUI() {
	return (
		<div style={wrap}>
			<DropZone supportingText="MP4, WebM, MOV, AVI, MKV — up to 500 MB each" />
			<FileListToolbar right={<FileListToolbar.ViewToggle />} />
			<FileList emptyMessage="No files selected yet." />
		</div>
	);
}

export function Default() {
	return (
		<UploadProvider config={demoConfig}>
			<ViewModeProvider>
				<UploadUI />
			</ViewModeProvider>
		</UploadProvider>
	);
}

const wrap: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "1rem",
};
