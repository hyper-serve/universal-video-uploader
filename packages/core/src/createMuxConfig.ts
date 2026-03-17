import { MuxAdapter } from "./adapter/mux.js";
import { MuxStatusChecker } from "./polling/mux.js";
import type {
	ErrorMessages,
	FileRef,
	FileState,
	MuxAssetStatus,
	MuxDirectUploadResponse,
	MuxUploadOptions,
	UploadConfig,
	ValidationResult,
} from "./types.js";

export type MuxConfig = {
	getUploadUrl: (
		options: MuxUploadOptions,
	) => Promise<MuxDirectUploadResponse>;
	getAssetStatus?: (uploadId: string) => Promise<MuxAssetStatus>;
	pollingIntervalMs?: number;
	maxConcurrentUploads?: number;
	maxFiles?: number;
	uploadOptions?: MuxUploadOptions;
	errorMessages?: ErrorMessages;
	validate?: (file: FileRef) => ValidationResult | Promise<ValidationResult>;
	onFileReady?: (file: FileState) => void;
	onUploadFailed?: (file: FileState) => void;
};

export function createMuxConfig(
	options: MuxConfig,
): UploadConfig<MuxUploadOptions> {
	return {
		adapter: new MuxAdapter({ getUploadUrl: options.getUploadUrl }),
		errorMessages: options.errorMessages,
		maxConcurrentUploads: options.maxConcurrentUploads,
		maxFiles: options.maxFiles,
		onFileReady: options.onFileReady,
		onUploadFailed: options.onUploadFailed,
		statusChecker: options.getAssetStatus
			? new MuxStatusChecker({
					getAssetStatus: options.getAssetStatus,
					intervalMs: options.pollingIntervalMs,
				})
			: undefined,
		uploadOptions: options.uploadOptions ?? {},
		validate: options.validate,
	};
}
