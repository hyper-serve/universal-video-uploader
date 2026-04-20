import { putVideoToStorage } from "@hyperserve/hyperserve-js/browser";
import type { FileRef, UploadAdapter, UploadResult } from "@hyperserve/upload";
import type { HyperserveAdapterConfig, HyperserveUploadOptions } from "../types.js";

export class HyperserveAdapter implements UploadAdapter<HyperserveUploadOptions> {
	constructor(private config: HyperserveAdapterConfig) {}

	async upload(
		file: FileRef,
		options: HyperserveUploadOptions,
		callbacks: { onProgress: (pct: number) => void },
		signal: AbortSignal,
	): Promise<UploadResult> {
		if (file.platform === "native") {
			throw new Error("File.raw is required for web uploads");
		}

		const { videoId, uploadUrl, contentType } = await this.config.createUpload(
			file,
			options,
		);

		await putVideoToStorage({
			contentType,
			file: file.raw,
			onProgress: callbacks.onProgress,
			signal,
			uploadUrl,
		});

		await this.config.completeUpload(videoId);

		return { videoId, metadata: { isPublic: options.isPublic } };
	}
}
