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
		backgroundColor: "#5589F1",
		borderRadius: 4,
		height: "100%",
	},
	track: {
		backgroundColor: "#e5e7eb",
		borderRadius: 4,
		height: 6,
		overflow: "hidden",
	},
});
