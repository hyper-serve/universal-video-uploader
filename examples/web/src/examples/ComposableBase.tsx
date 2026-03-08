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
	ProgressBar,
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
	const { clearCompleted, files, viewMode } = useUpload();
	const hasCompleted = files.some((f) => f.status === "ready");

	return (
		<div style={wrap}>
			<DropZone supportingText="MP4, WebM, MOV, AVI, MKV — up to 500 MB each" />

			<FileListToolbar
				right={
					<div style={toolbarRight}>
						<FileListToolbar.ViewToggle />
						{hasCompleted && (
							<button onClick={clearCompleted} style={clearBtn} type="button">
								Clear completed
							</button>
						)}
					</div>
				}
			/>

			<FileList emptyMessage="No files selected yet.">
				{(file) => (
					<FileItem
						file={file}
						key={file.id}
						layout={viewMode === "list" ? "row" : "column"}
						style={
							viewMode === "grid"
								? { height: "100%", position: "relative" }
								: undefined
						}
					>
						<Thumbnail file={file} style={viewMode === "list" ? thumbnailList : undefined} />
						{viewMode === "list" ? (
							<>
								<div style={listMiddle}>
									<FileItem.FileName />
									<FileItem.FileSize />
									{file.status === "uploading" && (
										<div style={progressWrap}>
											<ProgressBar progress={file.progress} />
										</div>
									)}
									{file.status === "processing" && (
										<div style={processing}>Processing on server…</div>
									)}
									{file.status === "ready" && file.playbackUrl && (
										<Thumbnail file={file} playback />
									)}
									<FileItem.ErrorMessage />
								</div>
								<div style={badges}>
									<StatusBadge status={file.status} />
									<FileItem.RetryButton />
									<FileItem.RemoveButton />
								</div>
							</>
						) : (
							<>
								<div style={row}>
									<FileItem.FileName />
									<div style={badges}>
										<StatusBadge status={file.status} />
										<FileItem.RetryButton />
										<FileItem.RemoveButton />
									</div>
								</div>
								<FileItem.FileSize />
								{file.status === "uploading" && (
									<ProgressBar progress={file.progress} />
								)}
								{file.status === "processing" && (
									<div style={processing}>Processing on server…</div>
								)}
								{file.status === "ready" && file.playbackUrl && (
									<Thumbnail file={file} playback />
								)}
								<FileItem.ErrorMessage />
							</>
						)}
					</FileItem>
				)}
			</FileList>
		</div>
	);
}

export function ComposableBase() {
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

const toolbarRight: React.CSSProperties = {
	alignItems: "center",
	display: "flex",
	gap: "0.75rem",
};

const clearBtn: React.CSSProperties = {
	background: "transparent",
	border: "none",
	color: "#5589F1",
	cursor: "pointer",
	fontSize: "0.875rem",
	padding: "0.25rem 0",
};

const row: React.CSSProperties = {
	alignItems: "center",
	display: "flex",
	justifyContent: "space-between",
};

const listMiddle: React.CSSProperties = {
	flex: 1,
	minWidth: 0,
	display: "flex",
	flexDirection: "column",
	gap: 2,
};

const thumbnailList: React.CSSProperties = {
	height: 56,
	width: 80,
	flexShrink: 0,
};

const progressWrap: React.CSSProperties = {
	width: "100%",
	marginTop: 2,
};

const badges: React.CSSProperties = {
	alignItems: "center",
	display: "flex",
	gap: "0.5rem",
};

const processing: React.CSSProperties = {
	color: "#d97706",
	fontSize: "0.8125rem",
};
