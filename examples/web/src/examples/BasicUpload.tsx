import React, { useRef } from "react";
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
		resolutions: "240p,480p",
	},
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
			<p style={{ color: "#64748b", marginBottom: "1rem" }}>
				Minimal setup: file input, progress bars, and status per file.
			</p>

			<input
				accept="video/*"
				multiple
				onChange={handleFileChange}
				ref={inputRef}
				style={{ display: "none" }}
				type="file"
			/>
			<button
				onClick={() => inputRef.current?.click()}
				style={buttonStyle}
				type="button"
			>
				Select Videos
			</button>

			{files.length === 0 && (
				<p style={{ color: "#94a3b8", marginTop: "2rem" }}>
					No files selected yet.
				</p>
			)}

			<div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
				{files.map((file) => (
					<div key={file.id} style={cardStyle}>
						<div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
							<span style={{ fontWeight: 500 }}>{file.ref.name}</span>
							<div style={{ alignItems: "center", display: "flex", gap: "0.5rem" }}>
								<StatusBadge status={file.status} />
								{file.status === "failed" && (
									<button
										onClick={() => retryFile(file.id)}
										style={smallButtonStyle}
										type="button"
									>
										Retry
									</button>
								)}
								<button
									onClick={() => removeFile(file.id)}
									style={{ ...smallButtonStyle, color: "#ef4444" }}
									type="button"
								>
									Remove
								</button>
							</div>
						</div>
						<div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
							{(file.ref.size / (1024 * 1024)).toFixed(1)} MB
						</div>
						{file.status === "uploading" && <ProgressBar progress={file.progress} />}
						{file.error && (
							<div style={{ color: "#ef4444", fontSize: "0.85rem" }}>
								{file.error}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

export function BasicUpload() {
	return (
		<UploadProvider config={config}>
			<UploadUI />
		</UploadProvider>
	);
}

const buttonStyle: React.CSSProperties = {
	background: "#3b82f6",
	border: "none",
	borderRadius: 6,
	color: "#fff",
	cursor: "pointer",
	fontSize: "0.9rem",
	padding: "0.6rem 1.2rem",
};

const smallButtonStyle: React.CSSProperties = {
	background: "none",
	border: "none",
	color: "#3b82f6",
	cursor: "pointer",
	fontSize: "0.8rem",
	padding: "0.25rem",
};

const cardStyle: React.CSSProperties = {
	background: "#f8fafc",
	border: "1px solid #e2e8f0",
	borderRadius: 8,
	display: "flex",
	flexDirection: "column",
	gap: "0.5rem",
	padding: "1rem",
};
