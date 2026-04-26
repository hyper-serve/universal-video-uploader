import { FileListToolbar } from "@hyperserve/upload-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { failedFile, processingFile, uploadingFile } from "./mockFileState";

const mockFiles = [uploadingFile, processingFile, failedFile];

export default function FileListToolbarDemo() {
	return (
		<div
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
