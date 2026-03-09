import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useUpload } from "@hyperserve/universal-video-uploader";
import type { FileRef } from "@hyperserve/universal-video-uploader";
import type { StyleProp, ViewStyle, TextStyle } from "react-native";
import { colors, radius } from "./theme.js";

export type FilePickerProps = {
	pickFiles: () => Promise<FileRef[]>;
	style?: StyleProp<ViewStyle>;
	textStyle?: StyleProp<TextStyle>;
	children?:
		| React.ReactNode
		| ((state: { pick: () => void }) => React.ReactNode);
};

export function FilePicker({
	pickFiles,
	style,
	textStyle,
	children,
}: FilePickerProps) {
	const { addFiles } = useUpload();

	const pick = useCallback(async () => {
		const refs = await pickFiles();
		if (refs.length > 0) {
			addFiles(refs);
		}
	}, [pickFiles, addFiles]);

	if (typeof children === "function") {
		return <>{children({ pick })}</>;
	}

	return (
		<Pressable onPress={pick} style={[styles.button, style]}>
			{children ?? (
				<Text style={[styles.text, textStyle]}>Pick Videos</Text>
			)}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		alignItems: "center",
		backgroundColor: colors.accent,
		borderRadius: radius.lg,
		paddingHorizontal: 18,
		paddingVertical: 12,
	},
	text: {
		color: colors.white,
		fontSize: 15,
		fontWeight: "600",
	},
});
