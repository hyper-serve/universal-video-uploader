import React from "react";
import {
	UploadProvider,
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
	return (
		<div>
			<p style={{ color: "#64748b", marginBottom: "1rem" }}>
				Custom drop zone with render prop + grid layout with thumbnails.
			</p>

			<DropZone>
				{({ isDragging }) => (
					<>
						<div style={{ fontSize: "2rem" }}>&#x1F3AC;</div>
						<div style={{ color: "#64748b" }}>
							{isDragging
								? "Drop your videos here"
								: "Drag & drop video files here"}
						</div>
					</>
				)}
			</DropZone>

			<div style={{ marginTop: "1.5rem" }}>
				<FileList mode="grid">
					{(file) => (
						<FileItem
							file={file}
							key={file.id}
							style={{ position: "relative" }}
						>
							<Thumbnail file={file} />
							<FileItem.FileName
								style={{ fontSize: "0.85rem" }}
							/>
							<StatusBadge status={file.status} />
							{file.status === "uploading" && (
								<ProgressBar progress={file.progress} />
							)}
							<FileItem.RemoveButton
								style={{
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
								}}
							>
								&#10005;
							</FileItem.RemoveButton>
						</FileItem>
					)}
				</FileList>
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
