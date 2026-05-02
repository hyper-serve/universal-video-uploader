import type {
	ErrorMessages,
	FileRef,
	FileState,
	UploadConfig,
	ValidationResult,
} from "@hyperserve/video-uploader";
import { HyperserveAdapter } from "./adapter/hyperserve.js";
import { HyperserveStatusChecker } from "./polling/index.js";
import type {
	HyperserveAdapterConfig,
	HyperserveUploadOptions,
	VideoStatusResult,
} from "./types.js";

export type HyperserveConfig = HyperserveAdapterConfig & {
	getVideoStatus?: (videoId: string) => Promise<VideoStatusResult>;
	maxConcurrentUploads?: number;
	maxFiles?: number;
	pollingIntervalMs?: number;
	uploadOptions: HyperserveUploadOptions;
	errorMessages?: ErrorMessages;
	validate?: (file: FileRef) => ValidationResult | Promise<ValidationResult>;
	onFileReady?: (file: FileState) => void;
	onUploadFailed?: (file: FileState) => void;
};

export function createHyperserveConfig(
	options: HyperserveConfig,
): UploadConfig<HyperserveUploadOptions> {
	return {
		adapter: new HyperserveAdapter({
			completeUpload: options.completeUpload,
			createUpload: options.createUpload,
		}),
		errorMessages: options.errorMessages,
		maxConcurrentUploads: options.maxConcurrentUploads,
		maxFiles: options.maxFiles,
		onFileReady: options.onFileReady,
		onUploadFailed: options.onUploadFailed,
		statusChecker: options.getVideoStatus
			? new HyperserveStatusChecker({
					getVideoStatus: options.getVideoStatus,
					intervalMs: options.pollingIntervalMs,
				})
			: undefined,
		uploadOptions: options.uploadOptions,
		validate: options.validate,
	};
}
