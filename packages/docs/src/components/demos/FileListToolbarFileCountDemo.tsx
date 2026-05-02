import { FileListToolbar } from "@hyperserve/upload-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { mockFileList } from "./mockFileState";

export default function FileListToolbarFileCountDemo() {
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
			<MockFilesProvider files={mockFileList}>
				<FileListToolbar
					left={
						<FileListToolbar.FileCount
							label={(count) => `${count} video${count !== 1 ? "s" : ""}`}
						/>
					}
				/>
			</MockFilesProvider>
		</div>
	);
}
