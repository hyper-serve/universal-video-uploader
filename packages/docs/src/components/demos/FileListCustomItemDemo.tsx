import { FileItem, FileList, Thumbnail } from "@hyperserve/video-uploader-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { mockFileList } from "./mockFileState";

export default function FileListCustomItemDemo() {
	return (
		<MockFilesProvider files={mockFileList}>
			<div
				className="not-content"
				style={{
					background: "#fff",
					border: "1px solid #e2e8f0",
					borderRadius: 8,
					padding: "1.5rem",
				}}
			>
				<FileList>
					{(file) => (
						<FileItem key={file.id} file={file} layout="column">
							<Thumbnail file={file} playback />
							<FileItem.FileName />
							<FileItem.UploadProgress />
							<FileItem.Actions>
								<FileItem.RemoveButton />
								<FileItem.RetryButton />
							</FileItem.Actions>
						</FileItem>
					)}
				</FileList>
			</div>
		</MockFilesProvider>
	);
}
