import { FileListToolbar } from "@hyperserve/upload-react";
import type React from "react";
import {
	failedFile,
	processingFile,
	uploadingFile,
} from "./mockFileState";
import { MockFilesProvider } from "./MockFilesProvider";

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
