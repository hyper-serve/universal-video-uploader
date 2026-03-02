import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { FileStatus } from "@hyperserve/universal-video-uploader";
import type { StyleProp, ViewStyle, TextStyle } from "react-native";
import { statusConfig } from "./utils.js";

export type StatusBadgeProps = {
	status: FileStatus;
	style?: StyleProp<ViewStyle>;
	textStyle?: StyleProp<TextStyle>;
	children?: (info: { label: string; color: string }) => React.ReactNode;
};

export function StatusBadge({
	status,
	style,
	textStyle,
	children,
}: StatusBadgeProps) {
	const config = statusConfig[status];

	if (children) {
		return <>{children({ color: config.text, label: config.label })}</>;
	}

	return (
		<View style={[styles.badge, { backgroundColor: config.bg }, style]}>
			<Text style={[styles.text, { color: config.text }, textStyle]}>
				{config.label.toLowerCase()}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	badge: {
		borderRadius: 12,
		paddingHorizontal: 8,
		paddingVertical: 2,
	},
	text: {
		fontSize: 12,
		fontWeight: "600",
	},
});
