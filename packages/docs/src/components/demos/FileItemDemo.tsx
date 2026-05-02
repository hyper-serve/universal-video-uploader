import { UploadProvider } from "@hyperserve/video-uploader";
import { FileItem } from "@hyperserve/video-uploader-react";
import { useMemo } from "react";
import { createMockConfig } from "./MockAdapter";
import { mockFileList } from "./mockFileState";

export default function FileItemDemo() {
	const config = useMemo(() => createMockConfig(), []);

	return (
		<UploadProvider config={config}>
			<div
				className="not-content"
				style={{
					background: "#fff",
					border: "1px solid #e2e8f0",
					borderRadius: 8,
					display: "flex",
					flexDirection: "column",
					gap: "0.75rem",
					padding: "1.5rem",
				}}
			>
				{mockFileList.map((file) => (
					<FileItem file={file} key={file.id} layout="row">
						<FileItem.Content />
					</FileItem>
				))}
			</div>
		</UploadProvider>
	);
}
