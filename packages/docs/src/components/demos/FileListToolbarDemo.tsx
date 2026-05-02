import { FileListToolbar } from "@hyperserve/video-uploader-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { failedFile, processingFile, uploadingFile } from "./mockFileState";

const mockFiles = [uploadingFile, processingFile, failedFile];

export default function FileListToolbarDemo() {
	return (
		<div
			className="not-content"
			style={{
				background: "#fff",
				border: "1px solid #e2e8f0",
				borderRadius: 8,
				padding: "1.5rem",
			}}
		>
			<MockFilesProvider files={mockFiles}>
				<FileListToolbar />
			</MockFilesProvider>
		</div>
	);
}
