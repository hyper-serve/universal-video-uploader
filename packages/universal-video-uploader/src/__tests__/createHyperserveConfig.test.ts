import { describe, expect, it, vi } from "vitest";
import { createHyperserveConfig } from "../createHyperserveConfig.js";
import { HyperserveAdapter } from "../adapter/hyperserve.js";
import { HyperserveStatusChecker } from "../polling/index.js";

describe("createHyperserveConfig", () => {
	it("returns config with HyperserveAdapter and HyperserveStatusChecker", () => {
		const config = createHyperserveConfig({
			apiKey: "key",
			uploadOptions: { isPublic: true, resolutions: "480p" },
		});

		expect(config.adapter).toBeInstanceOf(HyperserveAdapter);
		expect(config.statusChecker).toBeInstanceOf(HyperserveStatusChecker);
		expect(config.uploadOptions).toEqual({
			isPublic: true,
			resolutions: "480p",
		});
	});

	it("uses default baseUrl when not provided", () => {
		const config = createHyperserveConfig({
			apiKey: "key",
			uploadOptions: { isPublic: true, resolutions: "480p" },
		});

		expect(config.statusChecker).toBeInstanceOf(HyperserveStatusChecker);
	});

	it("passes through baseUrl, maxConcurrentUploads, pollingIntervalMs, validate", () => {
		const validate = vi.fn().mockResolvedValue({ valid: true });
		const config = createHyperserveConfig({
			apiKey: "key",
			baseUrl: "https://custom.api/v1",
			maxConcurrentUploads: 5,
			pollingIntervalMs: 5000,
			uploadOptions: { isPublic: false, resolutions: "1080p" },
			validate,
		});

		expect(config.maxConcurrentUploads).toBe(5);
		expect(config.validate).toBe(validate);
		expect(config.uploadOptions).toEqual({
			isPublic: false,
			resolutions: "1080p",
		});
	});

	it("passes through maxFiles, onFileReady, onUploadFailed", () => {
		const onFileReady = vi.fn();
		const onUploadFailed = vi.fn();
		const config = createHyperserveConfig({
			apiKey: "key",
			maxFiles: 5,
			onFileReady,
			onUploadFailed,
			uploadOptions: { isPublic: true, resolutions: "480p" },
		});

		expect(config.maxFiles).toBe(5);
		expect(config.onFileReady).toBe(onFileReady);
		expect(config.onUploadFailed).toBe(onUploadFailed);
	});
});
