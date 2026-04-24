import type React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";
import { colors, radius } from "./theme.js";

export type ProgressBarProps = {
	progress: number;
	trackStyle?: StyleProp<ViewStyle>;
	fillStyle?: StyleProp<ViewStyle>;
	children?: (progress: number) => React.ReactNode;
};

export function ProgressBar({
	progress,
	trackStyle,
	fillStyle,
	children,
}: ProgressBarProps) {
	if (children) {
		return <>{children(progress)}</>;
	}

	return (
		<View
			accessibilityRole="progressbar"
			accessibilityValue={{ max: 100, min: 0, now: progress }}
			accessible
			style={[styles.track, trackStyle]}
		>
			<View style={[styles.fill, { width: `${progress}%` }, fillStyle]} />
		</View>
	);
}

const styles = StyleSheet.create({
	fill: {
		backgroundColor: colors.accent,
		borderRadius: radius.sm,
		height: "100%",
	},
	track: {
		backgroundColor: colors.border,
		borderRadius: radius.sm,
		height: 6,
		overflow: "hidden",
	},
});
