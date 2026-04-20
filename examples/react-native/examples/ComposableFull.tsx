import React from "react";
import { StyleSheet, View } from "react-native";
import {
	FileList,
	FileListToolbar,
	FilePicker,
	ViewModeProvider,
} from "@hyperserve/upload-react-native";
import { pickVideos } from "./shared";

export function Default() {
	return (
		<ViewModeProvider>
			<View style={styles.wrap}>
				<View style={styles.controls}>
					<FilePicker pickFiles={pickVideos} />
					<FileListToolbar
						right={<FileListToolbar.ViewToggle />}
					/>
				</View>
				<FileList emptyMessage="No files selected yet." />
			</View>
		</ViewModeProvider>
	);
}

const styles = StyleSheet.create({
	controls: { flexDirection: "column", gap: 10 },
	wrap: { gap: 12 },
});
