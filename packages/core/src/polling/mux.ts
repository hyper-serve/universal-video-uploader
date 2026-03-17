import type {
	MuxAssetStatus,
	ProcessingStatus,
	StatusChecker,
	UploadResult,
} from "../types.js";
import { backoffDelay } from "./backoff.js";

type PollMuxStatusOptions = {
	getAssetStatus: (uploadId: string) => Promise<MuxAssetStatus>;
	intervalMs: number;
	onStatusChange: (
		status: ProcessingStatus,
		playbackUrl?: string,
		statusDetail?: string,
	) => void;
	signal: AbortSignal;
	uploadId: string;
};

export function pollMuxStatus(options: PollMuxStatusOptions): void {
	const { getAssetStatus, intervalMs, onStatusChange, signal, uploadId } =
		options;

	let consecutiveErrors = 0;

	const poll = async () => {
		if (signal.aborted) return;

		try {
			const result = await getAssetStatus(uploadId);
			consecutiveErrors = 0;

			switch (result.status) {
				case "ready": {
					const playbackUrl = result.playbackId
						? `https://stream.mux.com/${result.playbackId}.m3u8`
						: undefined;
					onStatusChange("ready", playbackUrl);
					return;
				}
				case "errored":
					onStatusChange("failed");
					return;
				case "waiting":
					onStatusChange("processing", undefined, "Waiting for upload");
					break;
				case "preparing":
					onStatusChange("processing", undefined, "Processing");
					break;
			}

			setTimeout(poll, intervalMs);
		} catch (error) {
			if (signal.aborted) return;
			consecutiveErrors += 1;
			setTimeout(poll, backoffDelay(intervalMs, consecutiveErrors));
		}
	};

	poll();
}

export type MuxStatusCheckerConfig = {
	getAssetStatus: (uploadId: string) => Promise<MuxAssetStatus>;
	intervalMs?: number;
};

export class MuxStatusChecker implements StatusChecker {
	private getAssetStatus: (uploadId: string) => Promise<MuxAssetStatus>;
	private intervalMs: number;

	constructor(config: MuxStatusCheckerConfig) {
		this.getAssetStatus = config.getAssetStatus;
		this.intervalMs = config.intervalMs ?? 5000;
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
		pollMuxStatus({
			getAssetStatus: this.getAssetStatus,
			intervalMs: this.intervalMs,
			onStatusChange: options.onStatusChange,
			signal: options.signal,
			uploadId: options.uploadResult.videoId,
		});
	}
}
