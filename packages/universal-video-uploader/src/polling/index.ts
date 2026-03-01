type PollOptions = {
	apiKey: string;
	baseUrl: string;
	intervalMs: number;
	isPublic: boolean;
	onStatusChange: (
		status: "processing" | "ready" | "failed",
		playbackUrl?: string,
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

			onStatusChange("processing");
			setTimeout(poll, intervalMs);
		} catch (error) {
			if (signal.aborted) return;
			setTimeout(poll, intervalMs);
		}
	};

	poll();
}
