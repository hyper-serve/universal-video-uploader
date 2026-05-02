import { FileList, FileListToolbar } from "@hyperserve/video-uploader-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { mockFileList } from "./mockFileState";

export default function ViewModeProviderDemo() {
	return (
		<div
			className="not-content"
			style={{
				background: "#fff",
				border: "1px solid #e2e8f0",
				borderRadius: 8,
				display: "flex",
				flexDirection: "column",
				gap: "1rem",
				padding: "1.5rem",
			}}
		>
			<MockFilesProvider defaultMode="grid" files={mockFileList}>
				<FileListToolbar />
				<FileList />
			</MockFilesProvider>
		</div>
	);
}
