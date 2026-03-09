import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import type { FileState, ViewMode } from "@hyperserve/universal-video-uploader";
import { useUpload } from "@hyperserve/universal-video-uploader";
import type { StyleProp, ViewStyle } from "react-native";
import { colors } from "./theme.js";

export type FileListProps = {
	mode?: ViewMode;
	style?: StyleProp<ViewStyle>;
	columns?: number;
	emptyMessage?: React.ReactNode;
	children: (file: FileState, index: number) => React.ReactElement;
};

export function FileList({
	mode,
	style,
	columns = 2,
	emptyMessage,
	children,
}: FileListProps) {
	const { files, viewMode } = useUpload();
	const resolvedMode = mode ?? viewMode;

	if (files.length === 0 && emptyMessage) {
		return (
			<View style={styles.empty}>
				{typeof emptyMessage === "string" ? (
					<Text style={styles.emptyText}>{emptyMessage}</Text>
				) : (
					emptyMessage
				)}
			</View>
		);
	}

	return (
		<FlatList
			contentContainerStyle={[styles.content, style]}
			data={files}
			key={resolvedMode === "grid" ? `grid-${columns}` : "list"}
			keyExtractor={(item) => item.id}
			numColumns={resolvedMode === "grid" ? columns : 1}
			renderItem={({ item, index }) => (
				<View
					style={
						resolvedMode === "grid" ? styles.gridItem : undefined
					}
				>
					{children(item, index)}
				</View>
			)}
		/>
	);
}

const styles = StyleSheet.create({
	content: {
		gap: 12,
	},
	empty: {
		alignItems: "center",
		paddingVertical: 40,
	},
	emptyText: {
		color: colors.textSecondary,
		fontSize: 14,
		textAlign: "center",
	},
	gridItem: {
		flex: 1,
		padding: 4,
	},
});
