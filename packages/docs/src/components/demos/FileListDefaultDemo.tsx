import { FileList } from "@hyperserve/upload-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { mockFileList } from "./mockFileState";

export default function FileListDefaultDemo() {
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
				<FileList />
			</div>
		</MockFilesProvider>
	);
}
