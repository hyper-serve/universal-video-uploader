import { FileItem, FileList, Thumbnail } from "@hyperserve/upload-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { THUMB_SVG, VIDEO_URL, mockFile, mockRef } from "./mockFileState";

const mockFiles = [
	mockFile({
		id: "flci-1",
		progress: 55,
		ref: { ...mockRef, name: "vacation-2024.mp4" },
		status: "uploading",
	}),
	mockFile({
		id: "flci-2",
		ref: { ...mockRef, name: "interview-raw.mp4" },
		status: "processing",
		statusDetail: "Transcoding 60%",
	}),
	mockFile({
		id: "flci-3",
		playbackUrl: VIDEO_URL,
		ref: { ...mockRef, name: "product-demo.mp4" },
		status: "ready",
		thumbnailUri: THUMB_SVG,
	}),
	mockFile({
		error: "Upload failed. Check your connection.",
		id: "flci-4",
		ref: { ...mockRef, name: "conference-talk.mp4" },
		status: "failed",
	}),
];

export default function FileListCustomItemDemo() {
	return (
		<MockFilesProvider files={mockFiles}>
			<div
				className="not-content"
				style={{
					background: "#fff",
					border: "1px solid #e2e8f0",
					borderRadius: 8,
					padding: "1.5rem",
				}}
			>
				<FileList>
					{(file) => (
						<FileItem key={file.id} file={file} layout="column">
							<Thumbnail file={file} playback />
							<FileItem.FileName />
							<FileItem.UploadProgress />
							<FileItem.Actions>
								<FileItem.RemoveButton />
								<FileItem.RetryButton />
							</FileItem.Actions>
						</FileItem>
					)}
				</FileList>
			</div>
		</MockFilesProvider>
	);
}
