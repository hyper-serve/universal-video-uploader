import type {
	FileRef,
	MuxDirectUploadResponse,
	MuxUploadOptions,
	UploadAdapter,
	UploadResult,
} from "../types.js";
import type { BackgroundUploadModule } from "../platform/backgroundUpload.native.js";
import { getBackgroundUpload } from "../platform/backgroundUpload.native.js";

export class MuxAdapter implements UploadAdapter<MuxUploadOptions> {
	private getUploadUrl: (
		options: MuxUploadOptions,
	) => Promise<MuxDirectUploadResponse>;
	private bgUpload: BackgroundUploadModule | null;

	constructor(
		config: {
			getUploadUrl: (
				options: MuxUploadOptions,
			) => Promise<MuxDirectUploadResponse>;
		},
		bgUpload?: BackgroundUploadModule | null,
	) {
		this.getUploadUrl = config.getUploadUrl;
		this.bgUpload = bgUpload ?? getBackgroundUpload();
	}

	async upload(
		file: FileRef,
		options: MuxUploadOptions,
		callbacks: { onProgress: (pct: number) => void },
		signal: AbortSignal,
	): Promise<UploadResult> {
		const { url, id } = await this.getUploadUrl(options);

		if (this.bgUpload) {
			return this.backgroundUpload(
				this.bgUpload,
				file,
				url,
				id,
				callbacks,
				signal,
			);
		}

		return this.fetchUpload(file, url, id, callbacks, signal);
	}

	private backgroundUpload(
		Upload: BackgroundUploadModule,
		file: FileRef,
		url: string,
		uploadId: string,
		callbacks: { onProgress: (pct: number) => void },
		signal: AbortSignal,
	): Promise<UploadResult> {
		return new Promise((resolve, reject) => {
			Upload.startUpload({
				headers: { "Content-Type": file.type },
				method: "PUT",
				notification: { enabled: false },
				path: file.uri,
				type: "raw",
				url,
			})
				.then((bgUploadId: string) => {
					const listeners: Array<{ remove: () => void }> = [];

					const cleanup = () => {
						for (const l of listeners) l.remove();
					};

					listeners.push(
						Upload.addListener("progress", bgUploadId, (data) => {
							callbacks.onProgress(Number(data.progress));
						}),
					);

					listeners.push(
						Upload.addListener("error", bgUploadId, (data) => {
							cleanup();
							reject(new Error(String(data.error)));
						}),
					);

					listeners.push(
						Upload.addListener(
							"completed",
							bgUploadId,
							() => {
								cleanup();
								resolve({
									videoId: uploadId,
									metadata: { uploadId },
								});
							},
						),
					);

					signal.addEventListener("abort", () => {
						cleanup();
						Upload.cancelUpload(bgUploadId);
						reject(new Error("Upload aborted"));
					});
				})
				.catch(reject);
		});
	}

	private async fetchUpload(
		file: FileRef,
		url: string,
		uploadId: string,
		callbacks: { onProgress: (pct: number) => void },
		signal: AbortSignal,
	): Promise<UploadResult> {
		const fileResponse = await fetch(file.uri);
		const blob = await fileResponse.blob();

		callbacks.onProgress(50);

		const response = await fetch(url, {
			body: blob,
			headers: { "Content-Type": file.type },
			method: "PUT",
			signal,
		});

		if (!response.ok) {
			throw new Error(`Upload failed with status ${response.status}`);
		}

		callbacks.onProgress(100);

		return { videoId: uploadId, metadata: { uploadId } };
	}
}
