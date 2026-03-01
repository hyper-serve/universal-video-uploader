import type { FileRef, UploadAdapter, UploadOptions } from "../types.js";

export type BackgroundUploadModule = {
	startUpload: (options: Record<string, unknown>) => Promise<string>;
	addListener: (
		event: string,
		uploadId: string,
		callback: (data: Record<string, unknown>) => void,
	) => { remove: () => void };
	cancelUpload: (uploadId: string) => void;
};

function getBackgroundUpload(): BackgroundUploadModule | null {
	try {
		return require("react-native-background-upload");
	} catch {
		return null;
	}
}

export class HyperserveAdapter implements UploadAdapter {
	private bgUpload: BackgroundUploadModule | null;

	constructor(bgUpload?: BackgroundUploadModule | null) {
		this.bgUpload = bgUpload ?? getBackgroundUpload();
	}

	async upload(
		file: FileRef,
		options: UploadOptions,
		config: { apiKey: string; baseUrl: string },
		callbacks: { onProgress: (pct: number) => void },
		signal: AbortSignal,
	): Promise<{ videoId: string; isPublic: boolean }> {
		if (this.bgUpload) {
			return this.backgroundUpload(
				this.bgUpload,
				file,
				options,
				config,
				callbacks,
				signal,
			);
		}

		return this.fetchUpload(file, options, config, callbacks, signal);
	}

	private backgroundUpload(
		Upload: BackgroundUploadModule,
		file: FileRef,
		options: UploadOptions,
		config: { apiKey: string; baseUrl: string },
		callbacks: { onProgress: (pct: number) => void },
		signal: AbortSignal,
	): Promise<{ videoId: string; isPublic: boolean }> {
		const parameters: Record<string, string> = {
			isPublic: String(options.isPublic),
			resolutions: options.resolutions,
		};

		if (options.thumbnailTimestamps) {
			parameters.thumbnail_timestamps_seconds = options.thumbnailTimestamps;
		}

		if (options.customUserMetadata) {
			parameters.custom_user_metadata = JSON.stringify(
				options.customUserMetadata,
			);
		}

		return new Promise((resolve, reject) => {
			Upload.startUpload({
				field: "file",
				headers: { "X-API-KEY": config.apiKey },
				method: "POST",
				notification: { enabled: false },
				parameters,
				path: file.uri,
				type: "multipart",
				url: `${config.baseUrl}/video`,
			})
				.then((uploadId: string) => {
					const listeners: Array<{ remove: () => void }> = [];

					const cleanup = () => {
						for (const l of listeners) l.remove();
					};

					listeners.push(
						Upload.addListener("progress", uploadId, (data) => {
							callbacks.onProgress(Number(data.progress));
						}),
					);

					listeners.push(
						Upload.addListener("error", uploadId, (data) => {
							cleanup();
							reject(new Error(String(data.error)));
						}),
					);

					listeners.push(
						Upload.addListener("completed", uploadId, (data) => {
							cleanup();
							try {
								const response = JSON.parse(
									String(data.responseBody),
								);
								resolve({
									isPublic: response.isPublic,
									videoId: response.id,
								});
							} catch {
								reject(new Error("Invalid response from server"));
							}
						}),
					);

					signal.addEventListener("abort", () => {
						cleanup();
						Upload.cancelUpload(uploadId);
						reject(new Error("Upload aborted"));
					});
				})
				.catch(reject);
		});
	}

	private async fetchUpload(
		file: FileRef,
		options: UploadOptions,
		config: { apiKey: string; baseUrl: string },
		callbacks: { onProgress: (pct: number) => void },
		signal: AbortSignal,
	): Promise<{ videoId: string; isPublic: boolean }> {
		const formData = new FormData();

		formData.append("file", {
			name: file.name,
			type: file.type,
			uri: file.uri,
		} as unknown as Blob);

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

		callbacks.onProgress(50);

		const response = await fetch(`${config.baseUrl}/video`, {
			body: formData,
			headers: { "X-API-KEY": config.apiKey },
			method: "POST",
			signal,
		});

		if (!response.ok) {
			throw new Error(`Upload failed with status ${response.status}`);
		}

		callbacks.onProgress(100);

		const data = await response.json();
		return { isPublic: data.isPublic, videoId: data.id };
	}
}
