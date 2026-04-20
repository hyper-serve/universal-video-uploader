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
		const res = await fetch(`${BASE_URL}/videos`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name: file.name, size: file.size, ...options }),
		}).then((r) => r.json());
		return { videoId: res.videoId, uploadUrl: res.uploadUrl, contentType: res.contentType };
	},
	completeUpload: async (videoId) => {
		await fetch(`${BASE_URL}/videos/${videoId}/complete`, {
			method: "POST",
			headers: { Authorization: `Bearer ${API_KEY}` },
		});
	},
	getVideoStatus: async (videoId) =>
		fetch(`${BASE_URL}/videos/${videoId}`, {
			headers: { Authorization: `Bearer ${API_KEY}` },
		}).then((r) => r.json()),
	uploadOptions: {
		isPublic: true,
		resolutions: ["240p", "480p", "720p"],
	},
	validate,
});
