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

function ListIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<line x1="8" y1="6" x2="21" y2="6" />
			<line x1="8" y1="12" x2="21" y2="12" />
			<line x1="8" y1="18" x2="21" y2="18" />
			<line x1="3" y1="6" x2="3.01" y2="6" />
			<line x1="3" y1="12" x2="3.01" y2="12" />
			<line x1="3" y1="18" x2="3.01" y2="18" />
		</svg>
	);
}

function GridIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<rect x="3" y="3" width="7" height="7" rx="1" />
			<rect x="14" y="3" width="7" height="7" rx="1" />
			<rect x="3" y="14" width="7" height="7" rx="1" />
			<rect x="14" y="14" width="7" height="7" rx="1" />
		</svg>
	);
}

function UploadUI() {
	const { clearCompleted, files, setViewMode, viewMode } = useUpload();
	const hasCompleted = files.some((f) => f.status === "ready");

	return (
		<div style={wrap}>
			<DropZone supportingText="MP4, WebM, MOV, AVI, MKV — up to 500 MB each" />

			<div style={toolbar}>
				<span style={fileCount}>{files.length} file{files.length !== 1 ? "s" : ""} added</span>
				<div style={viewToggles}>
					<button
						aria-label="List view"
						onClick={() => setViewMode("list" as ViewMode)}
						style={{ ...viewToggleBtn, ...(viewMode === "list" ? viewToggleActive : {}) }}
						type="button"
					>
						<ListIcon />
					</button>
					<button
						aria-label="Grid view"
						onClick={() => setViewMode("grid" as ViewMode)}
						style={{ ...viewToggleBtn, ...(viewMode === "grid" ? viewToggleActive : {}) }}
						type="button"
					>
						<GridIcon />
					</button>
				</div>
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

const toolbar: React.CSSProperties = {
	alignItems: "center",
	display: "flex",
	gap: "0.75rem",
};

const fileCount: React.CSSProperties = {
	color: "#374151",
	fontSize: "0.875rem",
};

const viewToggles: React.CSSProperties = {
	display: "flex",
	border: "1px solid #e5e7eb",
	borderRadius: 8,
	overflow: "hidden",
};

const viewToggleBtn: React.CSSProperties = {
	background: "#fff",
	border: "none",
	color: "#9ca3af",
	cursor: "pointer",
	padding: "0.5rem 0.65rem",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
};

const viewToggleActive: React.CSSProperties = {
	background: "#f3f4f6",
	color: "#374151",
};

const clearBtn: React.CSSProperties = {
	background: "transparent",
	border: "none",
	color: "#5589F1",
	cursor: "pointer",
	fontSize: "0.875rem",
	marginLeft: "auto",
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
