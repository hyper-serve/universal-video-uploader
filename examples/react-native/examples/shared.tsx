import React from "react";
import { useVideoPlayer, VideoView } from "expo-video";
import * as DocumentPicker from "expo-document-picker";
import {
	allowedTypes,
	composeValidators,
	createHyperserveConfig,
	maxDuration,
	maxFileSize,
	type FileRef,
	type FileState,
} from "@hyperserve/universal-video-uploader";

const validate = composeValidators(
	maxFileSize(500 * 1024 * 1024),
	allowedTypes(["video/*"]),
	maxDuration(120),
);

export const demoConfig = createHyperserveConfig({
	apiKey: process.env.EXPO_PUBLIC_HYPERSERVE_API_KEY ?? "",
	baseUrl:
		process.env.EXPO_PUBLIC_HYPERSERVE_BASE_URL ??
		"https://api.hyperserve.io/v1",
	uploadOptions: {
		isPublic: true,
		resolutions: "240p,480p,720p",
	},
	validate,
});

export async function pickVideos(): Promise<FileRef[]> {
	const result = await DocumentPicker.getDocumentAsync({
		multiple: true,
		type: "video/*",
	});
	if (result.canceled) return [];
	return result.assets
		.filter((a) => a.mimeType?.startsWith("video/"))
		.map((asset) => ({
			name: asset.name,
			size: asset.size ?? 0,
			type: asset.mimeType ?? "video/mp4",
			uri: asset.uri,
		}));
}

export function Playback({ file }: { file: FileState }) {
	const player = useVideoPlayer(
		file.status === "ready" && file.playbackUrl ? file.playbackUrl : null,
	);

	if (file.status !== "ready" || !file.playbackUrl) return null;
	return (
		<VideoView
			player={player}
			contentFit="contain"
			nativeControls
			style={{ backgroundColor: "#000", borderRadius: 8, height: 180, width: "100%" }}
		/>
	);
}
