import { FileListToolbar } from "@hyperserve/video-uploader-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { mockFileList } from "./mockFileState";

export default function FileListToolbarViewToggleDemo() {
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
				<FileListToolbar.ViewToggle>
					{({ viewMode, setViewMode }) => (
						<select
							onChange={(e) => setViewMode(e.target.value as "list" | "grid")}
							style={{ fontSize: "0.875rem" }}
							value={viewMode}
						>
							<option value="list">List</option>
							<option value="grid">Grid</option>
						</select>
					)}
				</FileListToolbar.ViewToggle>
			</MockFilesProvider>
		</div>
	);
}
