import { HyperserveAdapter } from "./adapter/hyperserve.js";
import type { HyperserveUploadOptions } from "./types.js";
import { HyperserveStatusChecker } from "./polling/index.js";
import type {
	ErrorMessages,
	FileRef,
	FileState,
	UploadConfig,
	ValidationResult,
} from "./types.js";

const DEFAULT_BASE_URL = "https://api.hyperserve.io/v1";

export type HyperserveConfig = {
	apiKey: string;
	baseUrl?: string;
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
	const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
	const adapterConfig = { apiKey: options.apiKey, baseUrl };

	return {
		adapter: new HyperserveAdapter(adapterConfig),
		errorMessages: options.errorMessages,
		maxConcurrentUploads: options.maxConcurrentUploads,
		maxFiles: options.maxFiles,
		onFileReady: options.onFileReady,
		onUploadFailed: options.onUploadFailed,
		statusChecker: new HyperserveStatusChecker({
			...adapterConfig,
			intervalMs: options.pollingIntervalMs,
		}),
		uploadOptions: options.uploadOptions,
		validate: options.validate,
	};
}
