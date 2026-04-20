import { describe, expect, it, vi } from "vitest";
import { createHyperserveConfig } from "../createHyperserveConfig.js";
import { HyperserveAdapter } from "../adapter/hyperserve.js";
import { HyperserveStatusChecker } from "../polling/index.js";

vi.mock("@hyperserve/hyperserve-js/browser", () => ({
	putVideoToStorage: vi.fn(),
}));

function makeCallbacks() {
	return {
		createUpload: vi.fn().mockResolvedValue({
			videoId: "v1",
			uploadUrl: "https://s3.example.com/presigned",
			contentType: "video/mp4",
		}),
		completeUpload: vi.fn().mockResolvedValue(undefined),
		getVideoStatus: vi.fn().mockResolvedValue({ status: "failed" }),
	};
}

describe("createHyperserveConfig", () => {
	it("returns config with HyperserveAdapter and HyperserveStatusChecker", () => {
		const { createUpload, completeUpload, getVideoStatus } = makeCallbacks();
		const config = createHyperserveConfig({
			createUpload,
			completeUpload,
			getVideoStatus,
			uploadOptions: { isPublic: true, resolutions: ["480p"] },
		});

		expect(config.adapter).toBeInstanceOf(HyperserveAdapter);
		expect(config.statusChecker).toBeInstanceOf(HyperserveStatusChecker);
		expect(config.uploadOptions).toEqual({
			isPublic: true,
			resolutions: ["480p"],
		});
	});

	it("omits statusChecker when getVideoStatus is not provided", () => {
		const { createUpload, completeUpload } = makeCallbacks();
		const config = createHyperserveConfig({
			createUpload,
			completeUpload,
			uploadOptions: { isPublic: true, resolutions: ["480p"] },
		});

		expect(config.statusChecker).toBeUndefined();
	});

	it("passes through maxConcurrentUploads, pollingIntervalMs, validate", () => {
		const { createUpload, completeUpload, getVideoStatus } = makeCallbacks();
		const validate = vi.fn().mockResolvedValue({ valid: true });
		const config = createHyperserveConfig({
			createUpload,
			completeUpload,
			getVideoStatus,
			maxConcurrentUploads: 5,
			pollingIntervalMs: 5000,
			uploadOptions: { isPublic: false, resolutions: ["1080p"] },
			validate,
		});

		expect(config.maxConcurrentUploads).toBe(5);
		expect(config.validate).toBe(validate);
		expect(config.uploadOptions).toEqual({
			isPublic: false,
			resolutions: ["1080p"],
		});
	});

	it("passes through maxFiles, onFileReady, onUploadFailed", () => {
		const { createUpload, completeUpload } = makeCallbacks();
		const onFileReady = vi.fn();
		const onUploadFailed = vi.fn();
		const config = createHyperserveConfig({
			createUpload,
			completeUpload,
			maxFiles: 5,
			onFileReady,
			onUploadFailed,
			uploadOptions: { isPublic: true, resolutions: ["480p"] },
		});

		expect(config.maxFiles).toBe(5);
		expect(config.onFileReady).toBe(onFileReady);
		expect(config.onUploadFailed).toBe(onUploadFailed);
	});

	it("passes through errorMessages", () => {
		const { createUpload, completeUpload } = makeCallbacks();
		const errorMessages = {
			processingFailed: "Processing error",
			validationError: "Validation error",
		};
		const config = createHyperserveConfig({
			createUpload,
			completeUpload,
			errorMessages,
			uploadOptions: { isPublic: true, resolutions: ["480p"] },
		});

		expect(config.errorMessages).toBe(errorMessages);
	});
});
