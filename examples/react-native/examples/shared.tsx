import React from "react";
import { useVideoPlayer, VideoView } from "expo-video";
import * as DocumentPicker from "expo-document-picker";
import { createHyperserveConfig } from "@hyperserve/upload-adapter-hyperserve";
import {
	allowedTypes,
	composeValidators,
	maxDuration,
	maxFileSize,
	type FileRef,
	type FileState,
} from "@hyperserve/upload";

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL ?? "http://localhost:3001";

const validate = composeValidators(
	maxFileSize(500 * 1024 * 1024),
	allowedTypes(["video/*"]),
	maxDuration(120),
);

export const demoConfig = createHyperserveConfig({
	createUpload: async (file, options) => {
		const r = await fetch(`${SERVER_URL}/create-upload`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ filename: file.name, fileSizeBytes: file.size, ...options }),
		});
		if (!r.ok) throw new Error(`Upload init failed: ${r.status}`);
		return r.json();
	},
	completeUpload: async (videoId) => {
		const r = await fetch(`${SERVER_URL}/complete-upload/${videoId}`, { method: "POST" });
		if (!r.ok) throw new Error(`Complete upload failed: ${r.status}`);
	},
	getVideoStatus: async (videoId) => {
		const r = await fetch(`${SERVER_URL}/video-status/${videoId}`);
		if (!r.ok) throw new Error(`Status check failed: ${r.status}`);
		return r.json();
	},
	uploadOptions: {
		isPublic: true,
		resolutions: ["240p", "480p", "720p"],
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
			platform: "native" as const,
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
