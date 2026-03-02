import { HyperserveAdapter } from "./adapter/hyperserve.js";
import { HyperserveStatusChecker } from "./polling/index.js";
import type {
	FileRef,
	UploadConfig,
	UploadOptions,
	ValidationResult,
} from "./types.js";

const DEFAULT_BASE_URL = "https://api.hyperserve.io/v1";

export type HyperserveConfig = {
	apiKey: string;
	baseUrl?: string;
	maxConcurrentUploads?: number;
	pollingIntervalMs?: number;
	uploadOptions: UploadOptions;
	validate?: (file: FileRef) => ValidationResult | Promise<ValidationResult>;
};

export function createHyperserveConfig(options: HyperserveConfig): UploadConfig {
	const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
	const adapterConfig = { apiKey: options.apiKey, baseUrl };

	return {
		adapter: new HyperserveAdapter(adapterConfig),
		maxConcurrentUploads: options.maxConcurrentUploads,
		statusChecker: new HyperserveStatusChecker({
			...adapterConfig,
			intervalMs: options.pollingIntervalMs,
		}),
		uploadOptions: options.uploadOptions,
		validate: options.validate,
	};
}
