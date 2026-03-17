import type { ProcessingStatus, StatusChecker, UploadResult } from "../types.js";
import { backoffDelay } from "./backoff.js";

type PollOptions = {
	apiKey: string;
	baseUrl: string;
	intervalMs: number;
	isPublic: boolean;
	onStatusChange: (
		status: ProcessingStatus,
		playbackUrl?: string,
		statusDetail?: string,
	) => void;
	signal: AbortSignal;
	videoId: string;
};

type VideoResolutionResponse = {
	id: string;
	status: string;
	thumbnail_image_urls?: string[];
	video_url?: string;
};

type VideoResponse = {
	id: string;
	isPublic: boolean;
	resolutions: Record<string, VideoResolutionResponse | undefined>;
	status: string;
};

export function pollVideoStatus(options: PollOptions): void {
	const {
		apiKey,
		baseUrl,
		intervalMs,
		isPublic,
		onStatusChange,
		signal,
		videoId,
	} = options;

	let consecutiveErrors = 0;

	const poll = async () => {
		if (signal.aborted) return;

		try {
			const endpoint = isPublic
				? `${baseUrl}/video/${videoId}/public`
				: `${baseUrl}/video/${videoId}/private/3600`;

			const response = await fetch(endpoint, {
				headers: { "X-API-KEY": apiKey },
				signal,
			});

			if (!response.ok) {
				throw new Error(`Poll failed with status ${response.status}`);
			}

			consecutiveErrors = 0;

			const data: VideoResponse = await response.json();

			if (data.status === "ready") {
				let playbackUrl: string | undefined;
				for (const key of Object.keys(data.resolutions)) {
					const resolution = data.resolutions[key];
					if (resolution?.video_url) {
						playbackUrl = resolution.video_url;
						break;
					}
				}
				onStatusChange("ready", playbackUrl);
				return;
			}

			if (data.status === "fail") {
				onStatusChange("failed");
				return;
			}

			const resolutionStatuses = Object.entries(data.resolutions)
				.filter(
					(entry): entry is [string, VideoResolutionResponse] =>
						entry[1] != null,
				)
				.map(([key, res]) => `${key}: ${res.status}`);
			const detail =
				resolutionStatuses.length > 0
					? resolutionStatuses.join(", ")
					: data.status;

			onStatusChange("processing", undefined, detail);
			setTimeout(poll, intervalMs);
		} catch (error) {
			if (signal.aborted) return;
			consecutiveErrors += 1;
			setTimeout(poll, backoffDelay(intervalMs, consecutiveErrors));
		}
	};

	poll();
}

export class HyperserveStatusChecker implements StatusChecker {
	private apiKey: string;
	private baseUrl: string;
	private intervalMs: number;

	constructor(config: {
		apiKey: string;
		baseUrl: string;
		intervalMs?: number;
	}) {
		this.apiKey = config.apiKey;
		this.baseUrl = config.baseUrl;
		this.intervalMs = config.intervalMs ?? 3000;
	}

	checkStatus(options: {
		uploadResult: UploadResult;
		onStatusChange: (
			status: ProcessingStatus,
			playbackUrl?: string,
			statusDetail?: string,
		) => void;
		signal: AbortSignal;
	}): void {
		const isPublic = (options.uploadResult.metadata?.isPublic ??
			true) as boolean;

		pollVideoStatus({
			apiKey: this.apiKey,
			baseUrl: this.baseUrl,
			intervalMs: this.intervalMs,
			isPublic,
			onStatusChange: (status, playbackUrl, statusDetail) => {
				options.onStatusChange(status, playbackUrl, statusDetail);
			},
			signal: options.signal,
			videoId: options.uploadResult.videoId,
		});
	}
}
