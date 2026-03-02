import {
	UploadProvider,
	composeValidators,
	maxFileSize,
	allowedTypes,
	maxDuration,
	type UploadConfig,
} from "@hyperserve/universal-video-uploader";
import {
	DropZone,
	FileItem,
	FileList,
	ProgressBar,
	StatusBadge,
} from "@hyperserve/universal-video-uploader-react";
import { CONFIG } from "../shared";

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
	return (
		<div>
			<p style={{ color: "#64748b", marginBottom: "0.5rem" }}>
				Files are validated before upload. Rules:
			</p>
			<ul
				style={{
					color: "#64748b",
					fontSize: "0.9rem",
					marginBottom: "1.5rem",
					paddingLeft: "1.5rem",
				}}
			>
				<li>Max size: 500 MB</li>
				<li>Allowed types: MP4, QuickTime, WebM</li>
				<li>Max duration: 120 seconds</li>
			</ul>

			<DropZone />

			<div style={{ marginTop: "1rem" }}>
				<FileList>
					{(file) => (
						<FileItem
							file={file}
							key={file.id}
							style={{
								background:
									file.status === "failed"
										? "#fef2f2"
										: "#f8fafc",
								borderColor:
									file.status === "failed"
										? "#fecaca"
										: "#e2e8f0",
							}}
						>
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
									<FileItem.RetryButton />
									<FileItem.RemoveButton />
								</div>
							</div>
							{file.status === "uploading" && (
								<ProgressBar progress={file.progress} />
							)}
							<FileItem.ErrorMessage />
						</FileItem>
					)}
				</FileList>
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
