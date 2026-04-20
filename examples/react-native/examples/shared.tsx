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

const API_KEY = process.env.EXPO_PUBLIC_HYPERSERVE_API_KEY ?? "";
const BASE_URL =
	process.env.EXPO_PUBLIC_HYPERSERVE_BASE_URL ?? "https://api.hyperserve.io/v1";

const validate = composeValidators(
	maxFileSize(500 * 1024 * 1024),
	allowedTypes(["video/*"]),
	maxDuration(120),
);

export const demoConfig = createHyperserveConfig({
	createUpload: async (file, options) => {
		const res = await fetch(`${BASE_URL}/video`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				filename: file.name,
				fileSizeBytes: file.size,
				resolutions: options.resolutions,
				isPublic: options.isPublic,
				...(options.metadata && { custom_user_metadata: options.metadata }),
				...(options.thumbnail && {
					thumbnail_timestamps_seconds: [options.thumbnail.timestampMs / 1000],
				}),
			}),
		}).then((r) => r.json());
		return { videoId: res.id, uploadUrl: res.uploadUrl, contentType: res.contentType };
	},
	completeUpload: async (videoId) => {
		await fetch(`${BASE_URL}/video/${videoId}/complete-upload`, {
			method: "POST",
			headers: { Authorization: `Bearer ${API_KEY}` },
		});
	},
	getVideoStatus: async (videoId) => {
		const res = await fetch(`${BASE_URL}/video/${videoId}/public`, {
			headers: { Authorization: `Bearer ${API_KEY}` },
		}).then((r) => r.json());

		const status =
			res.status === "ready" ? "ready" : res.status === "fail" ? "failed" : "processing";

		const readyResolution = Object.values(
			(res.resolutions ?? {}) as Record<string, { status: string; video_url: string }>,
		).find((r) => r?.status === "ready" && r?.video_url);

		return { status, playbackUrl: readyResolution?.video_url };
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
