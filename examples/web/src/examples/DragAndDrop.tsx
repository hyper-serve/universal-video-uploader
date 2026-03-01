import React, { useCallback, useState } from "react";
import {
	UploadProvider,
	toFileRefs,
	useUpload,
	type UploadConfig,
} from "@hyperserve/universal-video-uploader";
import { StatusBadge, ProgressBar, CONFIG } from "../shared";

const config: UploadConfig = {
	...CONFIG,
	uploadOptions: {
		isPublic: true,
		resolutions: "480p",
	},
};

function UploadUI() {
	const { files, addFiles, removeFile } = useUpload();
	const [isDragging, setIsDragging] = useState(false);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback(() => {
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			const videoFiles = Array.from(e.dataTransfer.files).filter((f) =>
				f.type.startsWith("video/"),
			);
			if (videoFiles.length > 0) {
				addFiles(toFileRefs(videoFiles));
			}
		},
		[addFiles],
	);

	return (
		<div>
			<p style={{ color: "#64748b", marginBottom: "1rem" }}>
				Drop zone with thumbnail previews from local file.
			</p>

			<div
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				style={{
					...dropZoneStyle,
					borderColor: isDragging ? "#3b82f6" : "#cbd5e1",
					background: isDragging ? "#eff6ff" : "#f8fafc",
				}}
			>
				<div style={{ fontSize: "2rem" }}>🎬</div>
				<div style={{ color: "#64748b" }}>
					{isDragging
						? "Drop your videos here"
						: "Drag & drop video files here"}
				</div>
			</div>

			<div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "1.5rem" }}>
				{files.map((file) => (
					<div key={file.id} style={tileStyle}>
						{file.thumbnailUri ? (
							<video
								muted
								src={file.thumbnailUri}
								style={{ borderRadius: 6, height: 100, objectFit: "cover", width: "100%" }}
							/>
						) : (
							<div style={placeholderStyle}>🎥</div>
						)}
						<div style={{ fontSize: "0.85rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
							{file.ref.name}
						</div>
						<StatusBadge status={file.status} />
						{file.status === "uploading" && <ProgressBar progress={file.progress} />}
						<button
							onClick={() => removeFile(file.id)}
							style={removeBtnStyle}
							type="button"
						>
							✕
						</button>
					</div>
				))}
			</div>
		</div>
	);
}

export function DragAndDrop() {
	return (
		<UploadProvider config={config}>
			<UploadUI />
		</UploadProvider>
	);
}

const dropZoneStyle: React.CSSProperties = {
	alignItems: "center",
	border: "2px dashed #cbd5e1",
	borderRadius: 12,
	display: "flex",
	flexDirection: "column",
	gap: "0.5rem",
	justifyContent: "center",
	minHeight: 180,
	transition: "all 0.2s",
};

const tileStyle: React.CSSProperties = {
	border: "1px solid #e2e8f0",
	borderRadius: 8,
	display: "flex",
	flexDirection: "column",
	gap: "0.4rem",
	padding: "0.75rem",
	position: "relative",
	width: 180,
};

const placeholderStyle: React.CSSProperties = {
	alignItems: "center",
	background: "#f1f5f9",
	borderRadius: 6,
	display: "flex",
	fontSize: "2rem",
	height: 100,
	justifyContent: "center",
};

const removeBtnStyle: React.CSSProperties = {
	background: "rgba(0,0,0,0.5)",
	border: "none",
	borderRadius: "50%",
	color: "#fff",
	cursor: "pointer",
	fontSize: "0.7rem",
	height: 22,
	position: "absolute",
	right: 6,
	top: 6,
	width: 22,
};
