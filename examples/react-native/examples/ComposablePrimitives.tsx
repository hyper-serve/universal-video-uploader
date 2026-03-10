import React from "react";
import { StyleSheet, View } from "react-native";
import { useUpload } from "@hyperserve/universal-video-uploader";
import {
	FileItem,
	FileList,
	FileListToolbar,
	FilePicker,
	StatusBadge,
	Thumbnail,
} from "@hyperserve/universal-video-uploader-native";
import { Pressable, Text } from "react-native";
import { pickVideos } from "./shared";

const ACCENT = "#5589F1";

export function ComposablePrimitives() {
	const { clearCompleted, files } = useUpload();
	const hasCompleted = files.some((f) => f.status === "ready");

	return (
		<View style={styles.wrap}>
			<View style={styles.controls}>
				<FilePicker pickFiles={pickVideos} />
				<FileListToolbar
					showViewToggle={false}
					right={
						hasCompleted ? (
							<Pressable onPress={clearCompleted}>
								<Text style={styles.clearBtnText}>Clear completed</Text>
							</Pressable>
						) : null
					}
				/>
			</View>
			<FileList emptyMessage="No files selected yet." mode="grid" columns={2}>
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

const styles = StyleSheet.create({
	clearBtnText: { color: ACCENT, fontSize: 14 },
	controls: { flexDirection: "column", gap: 10 },
	wrap: { gap: 12 },
});
