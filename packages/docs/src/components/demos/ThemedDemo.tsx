import { UploadProvider } from "@hyperserve/video-uploader";
import { DropZone, FileItem, FileList } from "@hyperserve/video-uploader-react";
import type React from "react";
import { useMemo } from "react";
import { createMockConfig } from "./MockAdapter";

function UploadUI() {
	return (
		<div style={wrap}>
			<DropZone activeStyle={dropZoneActive} style={dropZoneStyle}>
				{({ isDragging, openPicker }) => (
					<div style={dropContent}>
						<span
							style={{
								color: isDragging ? "#a5b4fc" : "#94a3b8",
								fontSize: "0.875rem",
							}}
						>
							{isDragging ? "Release to add" : "Drag videos here or "}
						</span>
						{!isDragging && (
							<button onClick={openPicker} style={browseBtn} type="button">
								browse
							</button>
						)}
					</div>
				)}
			</DropZone>

			<FileList
				emptyMessage={
					<span style={{ color: "#475569", fontSize: "0.875rem" }}>
						Drop files above to get started.
					</span>
				}
			>
				{(file) => (
					<FileItem file={file} key={file.id} layout="column" style={card}>
						<div style={cardHeader}>
							<FileItem.FileName style={{ color: "#f1f5f9" }} />
							<FileItem.RemoveButton style={{ color: "#64748b" }} />
						</div>
						<FileItem.Meta>
							<FileItem.FileSize style={{ color: "#64748b" }} />
							<FileItem.StatusIcon style={{ color: "#818cf8" }} />
						</FileItem.Meta>
						<FileItem.UploadProgress
							fillStyle={{
								background: "linear-gradient(90deg, #818cf8, #a78bfa)",
							}}
						/>
						<FileItem.ErrorMessage style={{ color: "#f87171" }} />
						<FileItem.RetryButton style={{ color: "#fb923c" }} />
					</FileItem>
				)}
			</FileList>
		</div>
	);
}

export default function ThemedDemo() {
	const config = useMemo(() => createMockConfig(), []);
	return (
		<div className="not-content" style={container}>
			<UploadProvider config={config}>
				<UploadUI />
			</UploadProvider>
		</div>
	);
}

const container: React.CSSProperties = {
	background: "#0f172a",
	border: "1px solid #1e293b",
	borderRadius: 8,
	padding: "1.5rem",
};

const wrap: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "1rem",
};

const dropZoneStyle: React.CSSProperties = {
	background: "#1e293b",
	border: "1px dashed #334155",
	borderRadius: 8,
	minHeight: 72,
};

const dropZoneActive: React.CSSProperties = {
	background: "#1e1b4b",
	borderColor: "#818cf8",
	borderStyle: "solid",
};

const dropContent: React.CSSProperties = {
	alignItems: "center",
	display: "flex",
	flexWrap: "wrap",
	gap: "0.5rem",
	justifyContent: "center",
	padding: "1rem",
};

const browseBtn: React.CSSProperties = {
	background: "none",
	border: "1px solid #4f46e5",
	borderRadius: 5,
	color: "#818cf8",
	cursor: "pointer",
	fontSize: "0.8125rem",
	padding: "0.25rem 0.625rem",
};

const card: React.CSSProperties = {
	background: "#1e293b",
	border: "1px solid #334155",
};

const cardHeader: React.CSSProperties = {
	alignItems: "center",
	display: "flex",
	justifyContent: "space-between",
};
