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
		borderRadius: 6,
		height: 100,
		width: "100%",
	},
	placeholder: {
		alignItems: "center",
		backgroundColor: "#f1f5f9",
		borderRadius: 6,
		height: 100,
		justifyContent: "center",
	},
	placeholderIcon: {
		backgroundColor: "#cbd5e1",
		borderRadius: 4,
		height: 32,
		width: 32,
	},
});
