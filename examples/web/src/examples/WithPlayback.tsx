import React from "react";
import {
	UploadProvider,
	useUpload,
	type UploadConfig,
} from "@hyperserve/universal-video-uploader";
import {
	DropZone,
	FileItem,
	FileList,
	ProgressBar,
	StatusBadge,
	Thumbnail,
} from "@hyperserve/universal-video-uploader-react";
import { CONFIG } from "../shared";

const config: UploadConfig = {
	...CONFIG,
	uploadOptions: {
		isPublic: true,
		resolutions: "480p",
	},
};

function UploadUI() {
	const { clearCompleted, files } = useUpload();
	const hasCompleted = files.some((f) => f.status === "ready");

	return (
		<div>
			<p style={{ color: "#64748b", marginBottom: "1rem" }}>
				Full lifecycle: upload → processing → playable video when ready.
			</p>

			<div
				style={{
					alignItems: "center",
					display: "flex",
					gap: "1rem",
					marginBottom: "1.5rem",
				}}
			>
				<DropZone
					style={{ flex: 1, minHeight: 80 }}
				/>
				{hasCompleted && (
					<button
						onClick={clearCompleted}
						style={secondaryBtnStyle}
						type="button"
					>
						Clear Completed
					</button>
				)}
			</div>

			<FileList>
				{(file) => (
					<FileItem file={file} key={file.id}>
						<div
							style={{
								alignItems: "center",
								display: "flex",
								justifyContent: "space-between",
							}}
						>
							<FileItem.FileName />
							<div
								style={{
									alignItems: "center",
									display: "flex",
									gap: "0.5rem",
								}}
							>
								<StatusBadge status={file.status} />
								<FileItem.RemoveButton>
									&#10005;
								</FileItem.RemoveButton>
							</div>
						</div>

						{file.status === "uploading" && (
							<ProgressBar progress={file.progress} />
						)}

						{file.status === "processing" && (
							<div
								style={{
									alignItems: "center",
									color: "#f59e0b",
									display: "flex",
									fontSize: "0.85rem",
									gap: "0.5rem",
								}}
							>
								Processing on server...
							</div>
						)}

						<Thumbnail file={file} playback />

						<FileItem.ErrorMessage />
					</FileItem>
				)}
			</FileList>
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

const secondaryBtnStyle: React.CSSProperties = {
	background: "#f1f5f9",
	border: "none",
	borderRadius: 6,
	color: "#475569",
	cursor: "pointer",
	fontSize: "0.9rem",
	padding: "0.6rem 1.2rem",
};
