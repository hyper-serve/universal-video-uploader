import type React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useUpload } from "@hyperserve/upload";
import type { StyleProp, ViewStyle, TextStyle } from "react-native";
import { colors, radius } from "./theme.js";
import { type ViewMode, useViewMode } from "./ViewModeContext.js";

export type FileListToolbarProps = {
	left?: React.ReactNode | null;
	right?: React.ReactNode | null;
	showFileCount?: boolean;
	showViewToggle?: boolean;
	style?: StyleProp<ViewStyle>;
};

export type FileCountProps = {
	label?: (count: number) => React.ReactNode;
	style?: StyleProp<TextStyle>;
};

function FileCount({ label, style }: FileCountProps) {
	const { files } = useUpload();
	const count = files.length;
	const content =
		label != null
			? label(count)
			: `${count} file${count !== 1 ? "s" : ""} added`;
	return <Text style={[styles.fileCount, style]}>{content}</Text>;
}

export type ViewToggleProps = {
	style?: StyleProp<ViewStyle>;
	children?: (state: {
		viewMode: ViewMode;
		setViewMode: (mode: ViewMode) => void;
	}) => React.ReactNode;
};

function ViewToggle({ style, children }: ViewToggleProps) {
	const { viewMode, setViewMode } = useViewMode();
	if (children) {
		return <>{children({ viewMode, setViewMode })}</>;
	}
	return (
		<View style={[styles.toggleGroup, style]}>
			<Pressable
				onPress={() => setViewMode("list")}
				style={[
					styles.toggleButton,
					viewMode === "list" && styles.toggleActive,
				]}
			>
				<Text
					style={[
						styles.toggleText,
						viewMode === "list" && styles.toggleTextActive,
					]}
				>
					List
				</Text>
			</Pressable>
			<Pressable
				onPress={() => setViewMode("grid")}
				style={[
					styles.toggleButton,
					viewMode === "grid" && styles.toggleActive,
				]}
			>
				<Text
					style={[
						styles.toggleText,
						viewMode === "grid" && styles.toggleTextActive,
					]}
				>
					Grid
				</Text>
			</Pressable>
		</View>
	);
}

export function FileListToolbar({
	left,
	right,
	showFileCount = true,
	showViewToggle = true,
	style,
}: FileListToolbarProps) {
	const leftContent =
		left !== undefined ? left : showFileCount ? <FileCount /> : null;
	const rightContent =
		right !== undefined ? right : showViewToggle ? <ViewToggle /> : null;

	return (
		<View style={[styles.toolbar, style]}>
			{leftContent}
			{rightContent}
		</View>
	);
}

FileListToolbar.FileCount = FileCount;
FileListToolbar.ViewToggle = ViewToggle;

const styles = StyleSheet.create({
	toolbar: {
		alignItems: "center",
		alignSelf: "stretch",
		flexDirection: "row",
		justifyContent: "space-between",
	},
	fileCount: { color: colors.textPrimary, fontSize: 14 },
	toggleGroup: {
		borderColor: colors.border,
		borderRadius: radius.md,
		borderWidth: 1,
		flexDirection: "row",
		overflow: "hidden",
	},
	toggleButton: { paddingHorizontal: 10, paddingVertical: 8 },
	toggleActive: { backgroundColor: colors.bgSubtle },
	toggleText: { color: colors.textMuted, fontSize: 13, fontWeight: "500" },
	toggleTextActive: { color: colors.textPrimary },
});
