import React from "react";
import {
	UploadProvider,
	allowedTypes,
	composeValidators,
	createHyperserveConfig,
	maxDuration,
	maxFileSize,
} from "@hyperserve/universal-video-uploader";
import {
	DropZone,
	FileList,
	FileListToolbar,
	ViewModeProvider,
} from "@hyperserve/universal-video-uploader-react";
import { HYPERSERVE_API_KEY, HYPERSERVE_BASE_URL } from "../shared";

const validate = composeValidators(
	maxFileSize(500 * 1024 * 1024),
	allowedTypes(["video/*"]),
	maxDuration(120),
);

const config = createHyperserveConfig({
	apiKey: HYPERSERVE_API_KEY,
	baseUrl: HYPERSERVE_BASE_URL,
	uploadOptions: {
		isPublic: true,
		resolutions: "240p,480p,720p",
	},
	validate,
});

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
		<UploadProvider config={config}>
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
