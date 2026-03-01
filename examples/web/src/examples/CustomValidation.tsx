import React, { useRef } from "react";
import {
	UploadProvider,
	toFileRefs,
	useUpload,
	composeValidators,
	maxFileSize,
	allowedTypes,
	maxDuration,
	type UploadConfig,
} from "@hyperserve/universal-video-uploader";
import { StatusBadge, ProgressBar, CONFIG } from "../shared";

const validate = composeValidators(
	maxFileSize(500 * 1024 * 1024),
	allowedTypes(["video/mp4", "video/quicktime", "video/webm"]),
	maxDuration(120),
);

const config: UploadConfig = {
	...CONFIG,
	uploadOptions: {
		isPublic: false,
		resolutions: "480p,1080p",
	},
	validate,
};

function UploadUI() {
	const { files, addFiles, removeFile, retryFile } = useUpload();
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			addFiles(toFileRefs(e.target.files));
			e.target.value = "";
		}
	};

	return (
		<div>
			<p style={{ color: "#64748b", marginBottom: "0.5rem" }}>
				Files are validated before upload. Rules:
			</p>
			<ul style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1.5rem", paddingLeft: "1.5rem" }}>
				<li>Max size: 500 MB</li>
				<li>Allowed types: MP4, QuickTime, WebM</li>
				<li>Max duration: 120 seconds</li>
			</ul>

			<input
				accept="video/*"
				multiple
				onChange={handleFileChange}
				ref={inputRef}
				style={{ display: "none" }}
				type="file"
			/>
			<button onClick={() => inputRef.current?.click()} style={btnStyle} type="button">
				Select Videos
			</button>

			<div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
				{files.map((file) => (
					<div
						key={file.id}
						style={{
							...cardStyle,
							borderColor: file.status === "failed" ? "#fecaca" : "#e2e8f0",
							background: file.status === "failed" ? "#fef2f2" : "#f8fafc",
						}}
					>
						<div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
							<span style={{ fontWeight: 500 }}>{file.ref.name}</span>
							<div style={{ alignItems: "center", display: "flex", gap: "0.5rem" }}>
								<StatusBadge status={file.status} />
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
						{file.status === "uploading" && <ProgressBar progress={file.progress} />}
						{file.error && (
							<div style={{ alignItems: "center", color: "#ef4444", display: "flex", fontSize: "0.85rem", gap: "0.3rem" }}>
								⚠ {file.error}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

export function CustomValidation() {
	return (
		<UploadProvider config={config}>
			<UploadUI />
		</UploadProvider>
	);
}

const btnStyle: React.CSSProperties = {
	background: "#3b82f6",
	border: "none",
	borderRadius: 6,
	color: "#fff",
	cursor: "pointer",
	fontSize: "0.9rem",
	padding: "0.6rem 1.2rem",
};

const cardStyle: React.CSSProperties = {
	border: "1px solid #e2e8f0",
	borderRadius: 8,
	display: "flex",
	flexDirection: "column",
	gap: "0.5rem",
	padding: "1rem",
};

const linkBtn: React.CSSProperties = {
	background: "none",
	border: "none",
	color: "#3b82f6",
	cursor: "pointer",
	fontSize: "0.8rem",
};
