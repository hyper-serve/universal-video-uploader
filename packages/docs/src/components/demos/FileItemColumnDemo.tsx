import { FileItem, Thumbnail } from "@hyperserve/upload-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { readyFile } from "./mockFileState";

export default function FileItemColumnDemo() {
	return (
		<MockFilesProvider files={[readyFile]}>
			<div
				className="not-content"
				style={{
					background: "#fff",
					border: "1px solid #e2e8f0",
					borderRadius: 8,
					maxWidth: 280,
					padding: "1.5rem",
				}}
			>
				<FileItem file={readyFile} layout="column">
					<Thumbnail file={readyFile} playback />
					<FileItem.FileName />
					<FileItem.Meta>
						<FileItem.FileSize />
						<FileItem.StatusIcon />
					</FileItem.Meta>
					<FileItem.UploadProgress />
					<FileItem.ErrorMessage />
					<FileItem.Actions>
						<FileItem.RemoveButton />
						<FileItem.RetryButton />
					</FileItem.Actions>
				</FileItem>
			</div>
		</MockFilesProvider>
	);
}
