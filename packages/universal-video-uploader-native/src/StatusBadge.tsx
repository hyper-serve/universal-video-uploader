import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { FileStatus } from "@hyperserve/universal-video-uploader";
import type { StyleProp, ViewStyle, TextStyle } from "react-native";
import { radius } from "./theme.js";
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
				{config.label}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	badge: {
		borderRadius: radius.pill,
		paddingHorizontal: 8,
		paddingVertical: 4,
	},
	text: {
		fontSize: 11,
		fontWeight: "600",
		letterSpacing: 0.3,
		textTransform: "uppercase",
	},
});
