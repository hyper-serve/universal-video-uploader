import React from "react";
import { UploadProvider } from "@hyperserve/upload";
import {
	DropZone,
	FileItem,
	FileList,
	FileListToolbar,
	Thumbnail,
	ViewModeProvider,
	useViewMode,
} from "@hyperserve/upload-react";
import { demoConfig } from "../shared";

function UploadUI() {
	const { viewMode } = useViewMode();

	return (
		<div style={wrap}>
			<DropZone supportingText="MP4, WebM, MOV, AVI, MKV — up to 500 MB each" />
			<FileListToolbar showViewToggle={false} />
			<FileList emptyMessage="No files selected yet." mode={viewMode}>
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

export function Composable() {
	return (
		<UploadProvider config={demoConfig}>
			<ViewModeProvider defaultMode="grid">
				<UploadUI />
			</ViewModeProvider>
		</UploadProvider>
	);
}

const wrap: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "1rem",
};
