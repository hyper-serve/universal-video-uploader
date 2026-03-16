import React, { useMemo } from "react";
import { UploadProvider } from "@hyper-serve/upload";
import {
	DropZone,
	FileItem,
	FileList,
	FileListToolbar,
	Thumbnail,
	ViewModeProvider,
	useViewMode,
} from "@hyper-serve/upload-react";
import { createMockConfig } from "./MockAdapter";

function UploadUI() {
	const { viewMode } = useViewMode();

	return (
		<div style={wrap}>
			<DropZone supportingText="MP4, WebM, MOV — up to 500 MB (simulated)" />
			<FileListToolbar showViewToggle={false} />
			<FileList emptyMessage="Drop or browse files to see composable items." mode={viewMode}>
				{(file) => (
					<FileItem key={file.id} file={file} layout="column">
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
	border: "1px solid var(--sl-color-gray-5)",
	borderRadius: 8,
	padding: "1.5rem",
	background: "var(--sl-color-bg)",
};

const wrap: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "1rem",
};
