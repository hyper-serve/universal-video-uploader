import { FileList } from "@hyperserve/upload-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { mockFileList } from "./mockFileState";

export default function FileListGridColumnsDemo() {
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
				<FileList columns="repeat(3, 1fr)" mode="grid" />
			</div>
		</MockFilesProvider>
	);
}
