import type {
	FileRef,
	MuxDirectUploadResponse,
	MuxUploadOptions,
	UploadAdapter,
	UploadResult,
} from "../types.js";

export class MuxAdapter implements UploadAdapter<MuxUploadOptions> {
	private getUploadUrl: (
		options: MuxUploadOptions,
	) => Promise<MuxDirectUploadResponse>;

	constructor(config: {
		getUploadUrl: (
			options: MuxUploadOptions,
		) => Promise<MuxDirectUploadResponse>;
	}) {
		this.getUploadUrl = config.getUploadUrl;
	}

	async upload(
		file: FileRef,
		options: MuxUploadOptions,
		callbacks: { onProgress: (pct: number) => void },
		signal: AbortSignal,
	): Promise<UploadResult> {
		if (file.platform === "native") {
			throw new Error("File.raw is required for web uploads");
		}

		const { url, id } = await this.getUploadUrl(options);

		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			xhr.upload.addEventListener("progress", (e) => {
				if (e.lengthComputable) {
					callbacks.onProgress(Math.round((e.loaded / e.total) * 100));
				}
			});

			xhr.addEventListener("load", () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					resolve({ videoId: id, metadata: { uploadId: id } });
				} else {
					reject(
						new Error(`Upload failed with status ${xhr.status}`),
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

			xhr.open("PUT", url);
			xhr.setRequestHeader("Content-Type", file.type);
			xhr.send(file.raw);
		});
	}
}
