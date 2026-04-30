import { FileItem, Thumbnail } from "@hyperserve/upload-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { THUMB_SVG, VIDEO_URL, mockFile, mockRef } from "./mockFileState";

const file = mockFile({
	id: "fic-1",
	playbackUrl: VIDEO_URL,
	ref: { ...mockRef, name: "product-demo.mp4" },
	status: "ready",
	thumbnailUri: THUMB_SVG,
});

export default function FileItemColumnDemo() {
	return (
		<MockFilesProvider files={[file]}>
			<div
				className="not-content"
				style={{
					background: "#fff",
					border: "1px solid #e2e8f0",
					borderRadius: 8,
					maxWidth: 280,
					padding: "1.5rem",
				}}
			>
				<FileItem file={file} layout="column">
					<Thumbnail file={file} playback />
					<FileItem.FileName />
					<FileItem.Meta>
						<FileItem.FileSize />
						<FileItem.StatusIcon />
					</FileItem.Meta>
					<FileItem.UploadProgress />
					<FileItem.ErrorMessage />
					<FileItem.Actions>
						<FileItem.RemoveButton />
						<FileItem.RetryButton />
					</FileItem.Actions>
				</FileItem>
			</div>
		</MockFilesProvider>
	);
}
