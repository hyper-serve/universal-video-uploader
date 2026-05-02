import { FileList } from "@hyperserve/video-uploader-react";
import { MockFilesProvider } from "./MockFilesProvider";

export default function FileListEmptyDemo() {
	return (
		<MockFilesProvider files={[]}>
			<div
				className="not-content"
				style={{
					background: "#fff",
					border: "1px solid #e2e8f0",
					borderRadius: 8,
					padding: "1.5rem",
				}}
			>
				<FileList emptyMessage="No files selected yet." />
			</div>
		</MockFilesProvider>
	);
}
