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
	FileItem,
	FileList,
	FileListToolbar,
	Thumbnail,
	ViewModeProvider,
	useViewMode,
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
	const { viewMode } = useViewMode();

	return (
		<div style={wrap}>
			<DropZone supportingText="MP4, WebM, MOV, AVI, MKV — up to 500 MB each" />
			<FileListToolbar showViewToggle={false} />
			<FileList emptyMessage="No files selected yet." mode={viewMode}>
				{(file) => (
					<FileItem key={file.id} file={file} layout="column">
						<Thumbnail file={file} playback />
						<FileItem.FileName />
						<FileItem.Meta>
							<FileItem.FileSize />
							<FileItem.StatusIcon />
						</FileItem.Meta>
						<FileItem.UploadProgress />
						<FileItem.ErrorMessage />
						<FileItem.Actions>
							<FileItem.RemoveButton />
							<FileItem.RetryButton />
						</FileItem.Actions>
					</FileItem>
				)}
			</FileList>
		</div>
	);
}

export function Composable() {
	return (
		<UploadProvider config={config}>
			<ViewModeProvider defaultMode="grid">
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
