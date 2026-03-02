import React from "react";
import { StyleSheet, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

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
			accessible
			accessibilityRole="progressbar"
			accessibilityValue={{ max: 100, min: 0, now: progress }}
			style={[styles.track, trackStyle]}
		>
			<View
				style={[styles.fill, { width: `${progress}%` }, fillStyle]}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	fill: {
		backgroundColor: "#3b82f6",
		borderRadius: 3,
		height: "100%",
	},
	track: {
		backgroundColor: "#e2e8f0",
		borderRadius: 3,
		height: 6,
		overflow: "hidden",
	},
});
