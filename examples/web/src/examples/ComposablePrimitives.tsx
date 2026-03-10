import React from "react";
import {
	UploadProvider,
	allowedTypes,
	composeValidators,
	createHyperserveConfig,
	maxDuration,
	maxFileSize,
	useUpload,
} from "@hyperserve/universal-video-uploader";
import {
	DropZone,
	FileItem,
	FileList,
	FileListToolbar,
	StatusBadge,
	Thumbnail,
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
	const { clearCompleted, files } = useUpload();
	const hasCompleted = files.some((f) => f.status === "ready");

	return (
		<div style={wrap}>
			<DropZone supportingText="MP4, WebM, MOV, AVI, MKV — up to 500 MB each" />
			<FileListToolbar
				right={
					hasCompleted ? (
						<button onClick={clearCompleted} style={clearBtn} type="button">
							Clear completed
						</button>
					) : null
				}
				showViewToggle={false}
			/>
			<FileList emptyMessage="No files selected yet." mode="grid">
				{(file) => (
					<FileItem key={file.id} file={file} layout="column">
						<Thumbnail file={file} />
						<FileItem.FileName />
						<FileItem.Meta>
							<FileItem.FileSize />
							<StatusBadge status={file.status} />
						</FileItem.Meta>
						<FileItem.UploadProgress />
						<FileItem.PlaybackPreview />
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

export function ComposablePrimitives() {
	return (
		<UploadProvider config={config}>
			<UploadUI />
		</UploadProvider>
	);
}

const wrap: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "1rem",
};

const clearBtn: React.CSSProperties = {
	background: "transparent",
	border: "none",
	color: "#5589F1",
	cursor: "pointer",
	fontSize: "0.875rem",
	padding: "0.25rem 0",
};
