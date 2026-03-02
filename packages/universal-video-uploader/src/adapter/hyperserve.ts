import type {
	FileRef,
	HyperserveUploadOptions,
	UploadAdapter,
	UploadResult,
} from "../types.js";

export class HyperserveAdapter implements UploadAdapter<HyperserveUploadOptions> {
	private apiKey: string;
	private baseUrl: string;

	constructor(config: { apiKey: string; baseUrl: string }) {
		this.apiKey = config.apiKey;
		this.baseUrl = config.baseUrl;
	}

	upload(
		file: FileRef,
		options: HyperserveUploadOptions,
		callbacks: { onProgress: (pct: number) => void },
		signal: AbortSignal,
	): Promise<UploadResult> {
		return new Promise((resolve, reject) => {
			if (!file.raw) {
				reject(new Error("File.raw is required for web uploads"));
				return;
			}

			const xhr = new XMLHttpRequest();
			const formData = new FormData();

			formData.append("file", file.raw);
			formData.append("resolutions", options.resolutions);
			formData.append("isPublic", String(options.isPublic));

			if (options.thumbnailTimestamps) {
				formData.append(
					"thumbnail_timestamps_seconds",
					options.thumbnailTimestamps,
				);
			}

			if (options.customUserMetadata) {
				formData.append(
					"custom_user_metadata",
					JSON.stringify(options.customUserMetadata),
				);
			}

			xhr.upload.addEventListener("progress", (e) => {
				if (e.lengthComputable) {
					callbacks.onProgress(Math.round((e.loaded / e.total) * 100));
				}
			});

			xhr.addEventListener("load", () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					try {
						const response = JSON.parse(xhr.responseText);
						resolve({
							metadata: { isPublic: response.isPublic },
							videoId: response.id,
						});
					} catch {
						reject(new Error("Invalid response from server"));
					}
				} else {
					reject(
						new Error(
							`Upload failed with status ${xhr.status}: ${xhr.responseText}`,
						),
					);
				}
			});

			xhr.addEventListener("error", () =>
				reject(new Error("Network error during upload")),
			);
			xhr.addEventListener("abort", () =>
				reject(new Error("Upload aborted")),
			);

			signal.addEventListener("abort", () => xhr.abort());

			xhr.open("POST", `${this.baseUrl}/video`);
			xhr.setRequestHeader("X-API-KEY", this.apiKey);
			xhr.send(formData);
		});
	}
}
