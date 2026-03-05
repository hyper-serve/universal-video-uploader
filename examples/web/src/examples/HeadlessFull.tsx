import React, { useRef, useState } from "react";
import {
	UploadProvider,
	allowedTypes,
	composeValidators,
	createHyperserveConfig,
	maxDuration,
	maxFileSize,
	toFileRefs,
	useUpload,
	type ViewMode,
} from "@hyperserve/universal-video-uploader";
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

const statusColors = {
	failed: "#ef4444",
	processing: "#f59e0b",
	ready: "#22c55e",
	selected: "#94a3b8",
	uploading: "#3b82f6",
	validating: "#8b5cf6",
} as const;

function UploadUI() {
	const {
		addFiles,
		clearCompleted,
		files,
		removeFile,
		retryFile,
		setViewMode,
		viewMode,
	} = useUpload();
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	const hasCompleted = files.some((f) => f.status === "ready");

	const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			addFiles(toFileRefs(e.target.files));
			e.target.value = "";
		}
	};

	const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		const files = Array.from(e.dataTransfer.files).filter((f) =>
			f.type.startsWith("video/"),
		);
		if (files.length > 0) {
			addFiles(toFileRefs(files));
		}
	};

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
				Headless-only demo with custom UI and full feature coverage.
			</p>
			<ul style={{ color: "#64748b", marginBottom: "1rem", paddingLeft: "1.2rem" }}>
				<li>Validation: max size 500MB, MP4/QuickTime/WebM, max duration 120s</li>
				<li>Retry + remove + clear completed</li>
				<li>List/Grid toggle + playback when ready</li>
			</ul>

			<input
				accept="video/*"
				multiple
				onChange={onInputChange}
				ref={inputRef}
				style={{ display: "none" }}
				type="file"
			/>
			<div
				onDragLeave={() => setIsDragging(false)}
				onDragOver={(e) => {
					e.preventDefault();
					setIsDragging(true);
				}}
				onDrop={onDrop}
				style={{
					...dropZone,
					background: isDragging ? "#eff6ff" : "#f8fafc",
					borderColor: isDragging ? "#3b82f6" : "#cbd5e1",
				}}
			>
				<div style={{ fontSize: "2rem" }}>&#x1F3AC;</div>
				<div style={{ color: "#64748b" }}>
					{isDragging
						? "Drop your videos here"
						: "Drag & drop video files here"}
				</div>
				<button
					onClick={() => inputRef.current?.click()}
					style={button}
					type="button"
				>
					Select Videos
				</button>
			</div>

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
						style={{ ...button, background: "#f1f5f9", color: "#334155" }}
						type="button"
					>
						Clear Completed
					</button>
				)}
			</div>

			{files.length === 0 && (
				<p style={{ color: "#94a3b8", marginTop: "1rem" }}>No files selected yet.</p>
			)}

			<div
				style={
					viewMode === "grid"
						? {
							display: "grid",
							gap: "1rem",
							gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
							marginTop: "1rem",
						}
						: { display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }
				}
			>
				{files.map((file) => (
					<div key={file.id} style={card}>
						<div
							style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}
						>
							<div style={{ fontWeight: 500 }}>{file.ref.name}</div>
							<div style={{ alignItems: "center", display: "flex", gap: "0.5rem" }}>
								<span
									style={{
										color: statusColors[file.status],
										fontSize: "0.8rem",
										fontWeight: 600,
									}}
								>
									{file.status}
								</span>
								{file.status === "failed" && (
									<button onClick={() => retryFile(file.id)} style={linkBtn} type="button">
										Retry
									</button>
								)}
								<button
									onClick={() => removeFile(file.id)}
									style={{ ...linkBtn, color: "#ef4444" }}
									type="button"
								>
									Remove
								</button>
							</div>
						</div>
						<div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
							{(file.ref.size / (1024 * 1024)).toFixed(1)} MB
						</div>
						{file.status === "uploading" && (
							<div style={progressTrack}>
								<div style={{ ...progressFill, width: `${file.progress}%` }} />
							</div>
						)}
						{file.status === "processing" && (
							<div style={{ color: "#f59e0b", fontSize: "0.85rem" }}>
								Processing on server...
							</div>
						)}
						{file.status === "ready" && file.playbackUrl && (
							<video controls src={file.playbackUrl} style={{ borderRadius: 8, width: "100%" }}>
								<track kind="captions" />
							</video>
						)}
						{file.error && (
							<div style={{ color: "#ef4444", fontSize: "0.85rem" }}>{file.error}</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

export function HeadlessFull() {
	return (
		<UploadProvider config={config}>
			<UploadUI />
		</UploadProvider>
	);
}

const button: React.CSSProperties = {
	background: "#3b82f6",
	border: "none",
	borderRadius: 6,
	color: "#fff",
	cursor: "pointer",
	fontSize: "0.85rem",
	padding: "0.45rem 0.85rem",
};

const linkBtn: React.CSSProperties = {
	background: "none",
	border: "none",
	color: "#3b82f6",
	cursor: "pointer",
	fontSize: "0.8rem",
	padding: "0.25rem",
};

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

const dropZone: React.CSSProperties = {
	alignItems: "center",
	border: "2px dashed #cbd5e1",
	borderRadius: 12,
	display: "flex",
	flexDirection: "column",
	gap: "0.6rem",
	justifyContent: "center",
	minHeight: 150,
	padding: "1rem",
	transition: "all 0.2s",
};

const card: React.CSSProperties = {
	background: "#f8fafc",
	border: "1px solid #e2e8f0",
	borderRadius: 8,
	display: "flex",
	flexDirection: "column",
	gap: "0.5rem",
	padding: "0.9rem",
};

const progressTrack: React.CSSProperties = {
	background: "#e2e8f0",
	borderRadius: 4,
	height: 6,
	overflow: "hidden",
};

const progressFill: React.CSSProperties = {
	background: "#3b82f6",
	height: "100%",
};
