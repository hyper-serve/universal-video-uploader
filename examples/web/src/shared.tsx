import { createHyperserveConfig } from "@hyperserve/upload-adapter-hyperserve";
import {
	allowedTypes,
	composeValidators,
	maxDuration,
	maxFileSize,
} from "@hyperserve/upload";

const API_KEY = import.meta.env.VITE_HYPERSERVE_API_KEY ?? "";
const BASE_URL =
	import.meta.env.VITE_HYPERSERVE_BASE_URL ?? "https://api.hyperserve.io/v1";

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
