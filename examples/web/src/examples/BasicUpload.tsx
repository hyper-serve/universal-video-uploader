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
} from "@hyperserve/universal-video-uploader-react";
import { CONFIG } from "../shared";

const config: UploadConfig = {
	...CONFIG,
	uploadOptions: {
		isPublic: true,
		resolutions: "240p,480p",
	},
};

function UploadUI() {
	return (
		<div>
			<p style={{ color: "#64748b", marginBottom: "1rem" }}>
				Composable components: DropZone + FileList with FileItem compound
				components.
			</p>

			<DropZone />

			<div style={{ marginTop: "1.5rem" }}>
				<FileList emptyMessage="No files selected yet.">
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
									<FileItem.RetryButton />
									<FileItem.RemoveButton />
								</div>
							</div>
							<FileItem.FileSize />
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

export function BasicUpload() {
	return (
		<UploadProvider config={config}>
			<UploadUI />
		</UploadProvider>
	);
}
