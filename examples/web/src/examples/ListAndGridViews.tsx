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
		resolutions: "240p,480p,720p",
	},
};

function UploadUI() {
	const { files, addFiles, removeFile, retryFile, viewMode, setViewMode } =
		useUpload();
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
				Toggle between list and grid views. Same data, different layout.
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
				<button
					onClick={() => inputRef.current?.click()}
					style={btnStyle}
					type="button"
				>
					Add Videos
				</button>

				<div style={toggleGroupStyle}>
					<button
						onClick={() => setViewMode("list")}
						style={{
							...toggleBtnStyle,
							...(viewMode === "list" ? toggleActiveStyle : {}),
						}}
						type="button"
					>
						☰ List
					</button>
					<button
						onClick={() => setViewMode("grid")}
						style={{
							...toggleBtnStyle,
							...(viewMode === "grid" ? toggleActiveStyle : {}),
						}}
						type="button"
					>
						▦ Grid
					</button>
				</div>
			</div>

			{viewMode === "list" ? (
				<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
					{files.map((file) => (
						<div key={file.id} style={listItemStyle}>
							{file.thumbnailUri && (
								<video
									muted
									src={file.thumbnailUri}
									style={{ borderRadius: 4, height: 48, objectFit: "cover", width: 64 }}
								/>
							)}
							<div style={{ flex: 1, minWidth: 0 }}>
								<div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
									{file.ref.name}
								</div>
								{file.status === "uploading" && (
									<ProgressBar progress={file.progress} />
								)}
							</div>
							<StatusBadge status={file.status} />
							{file.status === "failed" && (
								<button onClick={() => retryFile(file.id)} style={linkBtnStyle} type="button">
									Retry
								</button>
							)}
							<button
								onClick={() => removeFile(file.id)}
								style={{ ...linkBtnStyle, color: "#ef4444" }}
								type="button"
							>
								✕
							</button>
						</div>
					))}
				</div>
			) : (
				<div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
					{files.map((file) => (
						<div key={file.id} style={gridItemStyle}>
							{file.thumbnailUri ? (
								<video
									muted
									src={file.thumbnailUri}
									style={{ borderRadius: 6, height: 100, objectFit: "cover", width: "100%" }}
								/>
							) : (
								<div style={{ alignItems: "center", background: "#f1f5f9", borderRadius: 6, display: "flex", fontSize: "2rem", height: 100, justifyContent: "center" }}>
									🎥
								</div>
							)}
							<div style={{ fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
								{file.ref.name}
							</div>
							<StatusBadge status={file.status} />
							{file.status === "uploading" && <ProgressBar progress={file.progress} />}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export function ListAndGridViews() {
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

const toggleGroupStyle: React.CSSProperties = {
	border: "1px solid #e2e8f0",
	borderRadius: 6,
	display: "flex",
	overflow: "hidden",
};

const toggleBtnStyle: React.CSSProperties = {
	background: "#fff",
	border: "none",
	cursor: "pointer",
	fontSize: "0.85rem",
	padding: "0.5rem 0.75rem",
};

const toggleActiveStyle: React.CSSProperties = {
	background: "#3b82f6",
	color: "#fff",
};

const listItemStyle: React.CSSProperties = {
	alignItems: "center",
	border: "1px solid #e2e8f0",
	borderRadius: 8,
	display: "flex",
	gap: "0.75rem",
	padding: "0.75rem",
};

const gridItemStyle: React.CSSProperties = {
	border: "1px solid #e2e8f0",
	borderRadius: 8,
	display: "flex",
	flexDirection: "column",
	gap: "0.4rem",
	padding: "0.75rem",
};

const linkBtnStyle: React.CSSProperties = {
	background: "none",
	border: "none",
	color: "#3b82f6",
	cursor: "pointer",
	fontSize: "0.8rem",
};
