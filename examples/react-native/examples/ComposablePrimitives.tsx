import React from "react";
import { StyleSheet, View } from "react-native";
import {
	FileItem,
	FileList,
	FileListToolbar,
	FilePicker,
	StatusBadge,
	Thumbnail,
	ViewModeProvider,
	useViewMode,
} from "@hyperserve/upload-react-native";
import { pickVideos } from "./shared";

function UploadUI() {
	const { viewMode } = useViewMode();

	return (
		<View style={styles.wrap}>
			<View style={styles.controls}>
				<FilePicker pickFiles={pickVideos} />
				<FileListToolbar showViewToggle={false} />
			</View>
			<FileList emptyMessage="No files selected yet." mode={viewMode} columns={2}>
				{(file) => (
					<FileItem key={file.id} file={file} layout="column">
						<Thumbnail file={file} />
						<FileItem.FileName />
						<FileItem.Meta>
							<FileItem.FileSize />
							<StatusBadge status={file.status} />
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
		</View>
	);
}

export function Composable() {
	return (
		<ViewModeProvider defaultMode="grid">
			<UploadUI />
		</ViewModeProvider>
	);
}

const styles = StyleSheet.create({
	controls: { flexDirection: "column", gap: 10 },
	wrap: { gap: 12 },
});
