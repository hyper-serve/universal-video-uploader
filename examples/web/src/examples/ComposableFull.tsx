import React from "react";
import {
	UploadProvider,
	allowedTypes,
	composeValidators,
	maxDuration,
	maxFileSize,
	useUpload,
	type UploadConfig,
	type ViewMode,
} from "@hyperserve/universal-video-uploader";
import {
	DropZone,
	FileItem,
	FileList,
	ProgressBar,
	StatusBadge,
	Thumbnail,
} from "@hyperserve/universal-video-uploader-react";
import { CONFIG } from "../shared";

const validate = composeValidators(
	maxFileSize(500 * 1024 * 1024),
	allowedTypes(["video/mp4", "video/quicktime", "video/webm"]),
	maxDuration(120),
);

const config: UploadConfig = {
	...CONFIG,
	uploadOptions: {
		isPublic: true,
		resolutions: "240p,480p,720p",
	},
	validate,
};

function UploadUI() {
	const { clearCompleted, files, setViewMode, viewMode } = useUpload();
	const hasCompleted = files.some((f) => f.status === "ready");

	const modeToggle = (mode: ViewMode) => (
		<button
			onClick={() => setViewMode(mode)}
			style={{
				...toggleBtn,
				...(viewMode === mode ? toggleBtnActive : {}),
			}}
			type="button"
		>
			{mode === "list" ? "\u2630 List" : "\u25a6 Grid"}
		</button>
	);

	return (
		<div>
			<p style={{ color: "#64748b", marginBottom: "0.5rem" }}>
				Composable UI demo using the component package with full features.
			</p>
			<ul style={{ color: "#64748b", marginBottom: "1rem", paddingLeft: "1.2rem" }}>
				<li>Drop/select input + validation + retry/remove + clear completed</li>
				<li>List/Grid toggle + status + upload progress + error display</li>
				<li>Playback rendering when a file is ready</li>
			</ul>

			<DropZone />

			<div
				style={{
					alignItems: "center",
					display: "flex",
					gap: "0.75rem",
					marginTop: "1rem",
				}}
			>
				<div style={toggleGroup}>
					{modeToggle("list")}
					{modeToggle("grid")}
				</div>
				{hasCompleted && (
					<button
						onClick={clearCompleted}
						style={secondaryBtn}
						type="button"
					>
						Clear Completed
					</button>
				)}
			</div>

			<FileList
				emptyMessage="No files selected yet."
				style={{ marginTop: "1rem" }}
			>
				{(file) => (
					<FileItem
						file={file}
						key={file.id}
						style={
							viewMode === "grid"
								? { height: "100%", position: "relative" }
								: undefined
						}
					>
						{viewMode === "grid" && <Thumbnail file={file} />}
						<div
							style={{
								alignItems: "center",
								display: "flex",
								justifyContent: "space-between",
							}}
						>
							<FileItem.FileName />
							<div
								style={{
									alignItems: "center",
									display: "flex",
									gap: "0.5rem",
								}}
							>
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
							<div style={{ color: "#f59e0b", fontSize: "0.85rem" }}>
								Processing on server...
							</div>
						)}
						{file.status === "ready" && file.playbackUrl && (
							<Thumbnail file={file} playback />
						)}
						<FileItem.ErrorMessage />
					</FileItem>
				)}
			</FileList>
		</div>
	);
}

export function ComposableFull() {
	return (
		<UploadProvider config={config}>
			<UploadUI />
		</UploadProvider>
	);
}

const toggleGroup: React.CSSProperties = {
	border: "1px solid #e2e8f0",
	borderRadius: 6,
	display: "flex",
	overflow: "hidden",
};

const toggleBtn: React.CSSProperties = {
	background: "#fff",
	border: "none",
	cursor: "pointer",
	fontSize: "0.85rem",
	padding: "0.45rem 0.7rem",
};

const toggleBtnActive: React.CSSProperties = {
	background: "#3b82f6",
	color: "#fff",
};

const secondaryBtn: React.CSSProperties = {
	background: "#f1f5f9",
	border: "none",
	borderRadius: 6,
	color: "#334155",
	cursor: "pointer",
	fontSize: "0.85rem",
	padding: "0.45rem 0.8rem",
};
