import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useUpload } from "@hyperserve/universal-video-uploader";
import {
	FileList,
	FileListToolbar,
	FilePicker,
} from "@hyperserve/universal-video-uploader-native";
import { pickVideos } from "./shared";

const ACCENT = "#5589F1";

export function ComposableBase() {
	const { clearCompleted, files } = useUpload();
	const hasCompleted = files.some((f) => f.status === "ready");

	return (
		<View style={styles.wrap}>
			<View style={styles.controls}>
				<FilePicker pickFiles={pickVideos} />
				<FileListToolbar
					right={
						<View style={styles.toolbarRight}>
							<FileListToolbar.ViewToggle />
							{hasCompleted && (
								<Pressable onPress={clearCompleted}>
									<Text style={styles.clearBtnText}>Clear completed</Text>
								</Pressable>
							)}
						</View>
					}
				/>
			</View>
			<FileList emptyMessage="No files selected yet." />
		</View>
	);
}

const styles = StyleSheet.create({
	clearBtnText: { color: ACCENT, fontSize: 14 },
	controls: { flexDirection: "column", gap: 10 },
	toolbarRight: { alignItems: "center", flexDirection: "row", gap: 10 },
	wrap: { gap: 12 },
});
