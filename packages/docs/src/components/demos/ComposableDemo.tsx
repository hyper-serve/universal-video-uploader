import { UploadProvider } from "@hyperserve/upload";
import {
	DropZone,
	FileItem,
	FileList,
	FileListToolbar,
	Thumbnail,
	useViewMode,
	ViewModeProvider,
} from "@hyperserve/upload-react";
import type React from "react";
import { useMemo } from "react";
import { createMockConfig } from "./MockAdapter";

function UploadUI() {
	const { viewMode } = useViewMode();

	return (
		<div style={wrap}>
			<DropZone supportingText="Simulated upload — real uploads transcode to browser-compatible formats" />
			<FileListToolbar showViewToggle={false} />
			<FileList
				emptyMessage="Drop or browse files to see composable items."
				mode={viewMode}
			>
				{(file) => (
					<FileItem file={file} key={file.id} layout="column">
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
				)}
			</FileList>
		</div>
	);
}

export default function ComposableDemo() {
	const config = useMemo(() => createMockConfig(), []);

	return (
		<div style={container}>
			<UploadProvider config={config}>
				<ViewModeProvider defaultMode="grid">
					<UploadUI />
				</ViewModeProvider>
			</UploadProvider>
		</div>
	);
}

const container: React.CSSProperties = {
	background: "#fff",
	border: "1px solid #e2e8f0",
	borderRadius: 8,
	padding: "1.5rem",
};

const wrap: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "1rem",
};
