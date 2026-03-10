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
	ProgressBar,
	StatusBadge,
	Thumbnail,
	ViewModeProvider,
	useViewMode,
} from "@hyperserve/universal-video-uploader-react";
import type { FileStatus } from "@hyperserve/universal-video-uploader";
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

const darkStatusConfig: Partial<
	Record<FileStatus, { label: string; bg: string; text: string }>
> = {
	failed: { label: "Error", bg: "#451a1a", text: "#fca5a5" },
	processing: { label: "Processing", bg: "#422006", text: "#fcd34d" },
	ready: { label: "Done", bg: "#14532d", text: "#86efac" },
	selected: { label: "Queued", bg: "#1e293b", text: "#94a3b8" },
	uploading: { label: "Uploading", bg: "#0c4a6e", text: "#7dd3fc" },
	validating: { label: "Checking", bg: "#312e81", text: "#c4b5fd" },
};

function getStatusLabel(status: FileStatus): string {
	return darkStatusConfig[status]?.label ?? status;
}

function UploadUI() {
	const { viewMode, setViewMode } = useViewMode();

	return (
		<div style={wrap}>
			<p style={intro}>
				Custom — same components, full styling and slot overrides.
			</p>

			<DropZone
				style={dropZone}
				activeStyle={dropZoneActive}
				className="custom-drop"
				activeClassName="custom-drop-active"
			>
				{({ isDragging, openPicker }) => (
					<>
						<span style={dropIcon}>{isDragging ? "↓" : "⊕"}</span>
						<span style={dropLabel}>
							{isDragging
								? "Release to add videos"
								: "Drop videos or click to browse"}
						</span>
						<button
							onClick={(e) => {
								e.stopPropagation();
								openPicker();
							}}
							style={browseBtn}
							type="button"
						>
							Browse
						</button>
					</>
				)}
			</DropZone>

			<div style={toolbar}>
				<button
					onClick={() => setViewMode("list")}
					style={{ ...tab, ...(viewMode === "list" ? tabActive : {}) }}
					type="button"
				>
					List
				</button>
				<button
					onClick={() => setViewMode("grid")}
					style={{ ...tab, ...(viewMode === "grid" ? tabActive : {}) }}
					type="button"
				>
					Grid
				</button>
			</div>

			<FileList
				renderEmpty={() => (
					<div style={emptyBlock}>
						<div style={emptyIcon}>📁</div>
						<p style={emptyTitle}>No videos yet</p>
						<p style={emptyHint}>
							Use the area above to add videos. They’ll appear here.
						</p>
					</div>
				)}
				style={listStyle}
				className="custom-list"
			>
				{(file) => (
					<FileItem
						file={file}
						key={file.id}
						style={{
							...card,
							...(viewMode === "grid"
								? { height: "100%", position: "relative" }
								: {}),
						}}
						className="custom-file-item"
					>
						{viewMode === "grid" && (
							<Thumbnail
								file={file}
								style={thumbStyle}
								placeholderStyle={thumbPlaceholder}
							/>
						)}
						<div style={row}>
							<FileItem.FileName style={fileNameStyle} />
							<div style={badges}>
								<StatusBadge
									status={file.status}
									getLabel={getStatusLabel}
									statusConfig={darkStatusConfig}
									style={badgeStyle}
								/>
								<FileItem.RetryButton style={retryBtn} />
								<FileItem.RemoveButton
									style={removeBtn}
									ariaLabel="Remove file"
								>
									×
								</FileItem.RemoveButton>
							</div>
						</div>
						<FileItem.FileSize style={fileSizeStyle} />
						{file.status === "uploading" && (
							<ProgressBar
								progress={file.progress}
								trackStyle={progressTrack}
								fillStyle={progressFill}
							/>
						)}
						{file.status === "processing" && (
							<div style={processing}>Processing…</div>
						)}
						{file.status === "ready" && file.playbackUrl && (
							<Thumbnail
								file={file}
								playback
								style={{ ...thumbStyle, maxHeight: 220 }}
							/>
						)}
						<FileItem.ErrorMessage style={errorStyle} />
					</FileItem>
				)}
			</FileList>
		</div>
	);
}

export function Custom() {
	return (
		<UploadProvider config={config}>
			<ViewModeProvider>
				<div style={theme}>
					<UploadUI />
				</div>
			</ViewModeProvider>
		</UploadProvider>
	);
}

const theme: React.CSSProperties = {
	background: "#0f172a",
	borderRadius: 12,
	color: "#e2e8f0",
	padding: "1.5rem",
};

const wrap: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "1.25rem",
};

const intro: React.CSSProperties = {
	color: "#94a3b8",
	fontSize: "0.875rem",
	margin: 0,
};

const dropZone: React.CSSProperties = {
	background: "#1e293b",
	border: "2px dashed #475569",
	borderRadius: 10,
	minHeight: 140,
};

const dropZoneActive: React.CSSProperties = {
	background: "#0f172a",
	borderColor: "#38bdf8",
};

const dropIcon: React.CSSProperties = {
	display: "block",
	fontSize: "2rem",
	marginBottom: "0.25rem",
	opacity: 0.9,
};

const dropLabel: React.CSSProperties = {
	color: "#94a3b8",
	fontSize: "0.9rem",
};

const browseBtn: React.CSSProperties = {
	background: "#38bdf8",
	border: "none",
	borderRadius: 6,
	color: "#0f172a",
	cursor: "pointer",
	fontSize: "0.85rem",
	fontWeight: 600,
	marginTop: "0.5rem",
	padding: "0.4rem 0.9rem",
};

const toolbar: React.CSSProperties = {
	alignItems: "center",
	display: "flex",
	gap: "0.5rem",
};

const tab: React.CSSProperties = {
	background: "#1e293b",
	border: "1px solid #334155",
	borderRadius: 6,
	color: "#94a3b8",
	cursor: "pointer",
	fontSize: "0.85rem",
	padding: "0.4rem 0.65rem",
};

const tabActive: React.CSSProperties = {
	background: "#38bdf8",
	borderColor: "#38bdf8",
	color: "#0f172a",
};


const emptyBlock: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	gap: "0.5rem",
	textAlign: "center",
};

const emptyIcon: React.CSSProperties = {
	fontSize: "2.5rem",
	opacity: 0.6,
};

const emptyTitle: React.CSSProperties = {
	color: "#94a3b8",
	fontSize: "1rem",
	fontWeight: 600,
	margin: 0,
};

const emptyHint: React.CSSProperties = {
	color: "#64748b",
	fontSize: "0.8125rem",
	margin: 0,
};

const listStyle: React.CSSProperties = {
	marginTop: "0.25rem",
};

const card: React.CSSProperties = {
	background: "#1e293b",
	border: "1px solid #334155",
	borderRadius: 8,
	padding: "1rem",
};

const row: React.CSSProperties = {
	alignItems: "center",
	display: "flex",
	justifyContent: "space-between",
};

const fileNameStyle: React.CSSProperties = {
	color: "#f1f5f9",
};

const badges: React.CSSProperties = {
	alignItems: "center",
	display: "flex",
	gap: "0.5rem",
};

const badgeStyle: React.CSSProperties = {
	fontSize: "0.7rem",
};

const retryBtn: React.CSSProperties = {
	background: "none",
	border: "none",
	color: "#38bdf8",
	cursor: "pointer",
	fontSize: "0.8rem",
	padding: "0.2rem",
};

const removeBtn: React.CSSProperties = {
	background: "none",
	border: "none",
	color: "#f87171",
	cursor: "pointer",
	fontSize: "1.1rem",
	lineHeight: 1,
	padding: "0.2rem",
};

const fileSizeStyle: React.CSSProperties = {
	color: "#64748b",
	fontSize: "0.75rem",
};

const progressTrack: React.CSSProperties = {
	background: "#334155",
	borderRadius: 4,
	height: 6,
};

const progressFill: React.CSSProperties = {
	background: "#38bdf8",
	borderRadius: 4,
};

const thumbStyle: React.CSSProperties = {
	borderRadius: 6,
	overflow: "hidden",
};

const thumbPlaceholder: React.CSSProperties = {
	background: "#334155",
	color: "#64748b",
};

const processing: React.CSSProperties = {
	color: "#fcd34d",
	fontSize: "0.85rem",
};

const errorStyle: React.CSSProperties = {
	color: "#fca5a5",
	fontSize: "0.85rem",
};
