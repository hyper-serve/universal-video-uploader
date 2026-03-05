import React from "react";
import {
	UploadProvider,
	allowedTypes,
	composeValidators,
	createHyperserveConfig,
	maxDuration,
	maxFileSize,
	useUpload,
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
	const { clearCompleted, files, setViewMode, viewMode } = useUpload();
	const hasCompleted = files.some((f) => f.status === "ready");

	return (
		<div style={wrap}>
			<p style={intro}>
				Composable (Base) — library components with default props only.
			</p>

			<DropZone />

			<div style={toolbar}>
				<button
					onClick={() => setViewMode("list" as ViewMode)}
					style={{
						...tab,
						...(viewMode === "list" ? tabActive : {}),
					}}
					type="button"
				>
					List
				</button>
				<button
					onClick={() => setViewMode("grid" as ViewMode)}
					style={{
						...tab,
						...(viewMode === "grid" ? tabActive : {}),
					}}
					type="button"
				>
					Grid
				</button>
				{hasCompleted && (
					<button onClick={clearCompleted} style={clearBtn} type="button">
						Clear completed
					</button>
				)}
			</div>

			<FileList emptyMessage="No files selected yet.">
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

const intro: React.CSSProperties = {
	color: "#64748b",
	fontSize: "0.875rem",
	margin: 0,
};

const toolbar: React.CSSProperties = {
	alignItems: "center",
	display: "flex",
	gap: "0.5rem",
};

const tab: React.CSSProperties = {
	background: "#fff",
	border: "1px solid #e2e8f0",
	borderRadius: 6,
	cursor: "pointer",
	fontSize: "0.85rem",
	padding: "0.4rem 0.65rem",
};

const tabActive: React.CSSProperties = {
	background: "#3b82f6",
	borderColor: "#3b82f6",
	color: "#fff",
};

const clearBtn: React.CSSProperties = {
	background: "#f1f5f9",
	border: "none",
	borderRadius: 6,
	color: "#334155",
	cursor: "pointer",
	fontSize: "0.85rem",
	marginLeft: "auto",
	padding: "0.4rem 0.75rem",
};

const row: React.CSSProperties = {
	alignItems: "center",
	display: "flex",
	justifyContent: "space-between",
};

const badges: React.CSSProperties = {
	alignItems: "center",
	display: "flex",
	gap: "0.5rem",
};

const processing: React.CSSProperties = {
	color: "#f59e0b",
	fontSize: "0.85rem",
};
