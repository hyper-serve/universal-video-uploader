import type { FileState } from "@hyperserve/upload";
import { useUpload } from "@hyperserve/upload";
import type React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { FileItem } from "./FileItem.js";
import { colors } from "./theme.js";
import { useViewMode, type ViewMode } from "./ViewModeContext.js";

export type FileListProps = {
	mode?: ViewMode;
	style?: StyleProp<ViewStyle>;
	columns?: number;
	emptyMessage?: React.ReactNode;
	children?: (file: FileState, index: number) => React.ReactElement;
};

export function FileList({
	mode,
	style,
	columns = 2,
	emptyMessage,
	children,
}: FileListProps) {
	const { files } = useUpload();
	const { viewMode } = useViewMode();
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

	const renderItem = children ?? makeDefaultRenderItem(resolvedMode);

	return (
		<FlatList
			contentContainerStyle={[styles.content, style]}
			data={files}
			key={resolvedMode === "grid" ? `grid-${columns}` : "list"}
			keyExtractor={(item) => item.id}
			numColumns={resolvedMode === "grid" ? columns : 1}
			renderItem={({ item, index }) => (
				<View style={resolvedMode === "grid" ? styles.gridItem : undefined}>
					{renderItem(item, index)}
				</View>
			)}
		/>
	);
}

function makeDefaultRenderItem(resolvedMode: ViewMode) {
	return function renderItem(file: FileState): React.ReactElement {
		return (
			<FileItem
				file={file}
				key={file.id}
				layout={resolvedMode === "list" ? "row" : "column"}
			>
				<FileItem.Content />
			</FileItem>
		);
	};
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
