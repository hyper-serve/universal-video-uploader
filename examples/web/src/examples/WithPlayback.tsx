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
		resolutions: "480p",
	},
};

function UploadUI() {
	const { files, addFiles, removeFile, clearCompleted } = useUpload();
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			addFiles(toFileRefs(e.target.files));
			e.target.value = "";
		}
	};

	const hasCompleted = files.some((f) => f.status === "ready");

	return (
		<div>
			<p style={{ color: "#64748b", marginBottom: "1rem" }}>
				Full lifecycle: upload → processing → playable {"<video>"} when ready.
			</p>

			<div style={{ alignItems: "center", display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
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
				{hasCompleted && (
					<button onClick={clearCompleted} style={secondaryBtnStyle} type="button">
						Clear Completed
					</button>
				)}
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
				{files.map((file) => (
					<div key={file.id} style={cardStyle}>
						<div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
							<span style={{ fontWeight: 500 }}>{file.ref.name}</span>
							<div style={{ alignItems: "center", display: "flex", gap: "0.5rem" }}>
								<StatusBadge status={file.status} />
								<button
									onClick={() => removeFile(file.id)}
									style={linkBtn}
									type="button"
								>
									✕
								</button>
							</div>
						</div>

						{file.status === "uploading" && <ProgressBar progress={file.progress} />}

						{file.status === "processing" && (
							<div style={{ alignItems: "center", color: "#f59e0b", display: "flex", fontSize: "0.85rem", gap: "0.5rem" }}>
								<span style={spinnerStyle}>⟳</span>
								Processing on server...
							</div>
						)}

						{file.status === "ready" && file.playbackUrl && (
							<div style={{ marginTop: "0.5rem" }}>
								<video
									controls
									src={file.playbackUrl}
									style={{ borderRadius: 8, maxHeight: 300, width: "100%" }}
								>
									<track kind="captions" />
								</video>
								<div style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "0.25rem" }}>
									{file.playbackUrl}
								</div>
							</div>
						)}

						{file.status === "ready" && !file.playbackUrl && (
							<div style={{ color: "#22c55e", fontSize: "0.85rem" }}>
								✓ Ready (no playback URL returned — check API response)
							</div>
						)}

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

export function WithPlayback() {
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

const secondaryBtnStyle: React.CSSProperties = {
	...btnStyle,
	background: "#f1f5f9",
	color: "#475569",
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
	color: "#94a3b8",
	cursor: "pointer",
	fontSize: "1rem",
};

const spinnerStyle: React.CSSProperties = {
	animation: "spin 1s linear infinite",
	display: "inline-block",
};
