import React from "react";
import { Image, StyleSheet, View } from "react-native";
import type { FileState } from "@hyperserve/universal-video-uploader";
import type { StyleProp, ViewStyle, ImageStyle } from "react-native";

export type ThumbnailProps = {
	file: FileState;
	style?: StyleProp<ImageStyle>;
	placeholderStyle?: StyleProp<ViewStyle>;
	children?: (info: {
		thumbnailUri: string | null;
		playbackUrl: string | null;
		isReady: boolean;
	}) => React.ReactNode;
};

export function Thumbnail({
	file,
	style,
	placeholderStyle,
	children,
}: ThumbnailProps) {
	const isReady = file.status === "ready";

	if (children) {
		return (
			<>
				{children({
					isReady,
					playbackUrl: file.playbackUrl,
					thumbnailUri: file.thumbnailUri,
				})}
			</>
		);
	}

	if (file.thumbnailUri) {
		return (
			<Image
				source={{ uri: file.thumbnailUri }}
				style={[styles.image, style]}
			/>
		);
	}

	return (
		<View style={[styles.placeholder, placeholderStyle]}>
			<View style={styles.placeholderIcon} />
		</View>
	);
}

const styles = StyleSheet.create({
	image: {
		borderRadius: 8,
		height: 100,
		width: "100%",
	},
	placeholder: {
		alignItems: "center",
		backgroundColor: "#f3f4f6",
		borderRadius: 8,
		height: 100,
		justifyContent: "center",
	},
	placeholderIcon: {
		backgroundColor: "#d1d5db",
		borderRadius: 6,
		height: 32,
		width: 32,
	},
});
