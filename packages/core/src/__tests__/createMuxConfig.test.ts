import { describe, expect, it, vi } from "vitest";
import { createMuxConfig } from "../createMuxConfig.js";
import { MuxAdapter } from "../adapter/mux.js";
import { MuxStatusChecker } from "../polling/mux.js";

const mockGetUploadUrl = vi.fn();
const mockGetAssetStatus = vi.fn();

describe("createMuxConfig", () => {
	it("returns config with MuxAdapter", () => {
		const config = createMuxConfig({
			getUploadUrl: mockGetUploadUrl,
		});

		expect(config.adapter).toBeInstanceOf(MuxAdapter);
		expect(config.uploadOptions).toEqual({});
	});

	it("includes MuxStatusChecker when getAssetStatus is provided", () => {
		const config = createMuxConfig({
			getUploadUrl: mockGetUploadUrl,
			getAssetStatus: mockGetAssetStatus,
		});

		expect(config.statusChecker).toBeInstanceOf(MuxStatusChecker);
	});

	it("omits statusChecker when getAssetStatus is not provided", () => {
		const config = createMuxConfig({
			getUploadUrl: mockGetUploadUrl,
		});

		expect(config.statusChecker).toBeUndefined();
	});

	it("passes through uploadOptions", () => {
		const config = createMuxConfig({
			getUploadUrl: mockGetUploadUrl,
			uploadOptions: { passthrough: "post-456" },
		});

		expect(config.uploadOptions).toEqual({ passthrough: "post-456" });
	});

	it("passes through maxConcurrentUploads, maxFiles, validate", () => {
		const validate = vi.fn().mockResolvedValue({ valid: true });
		const config = createMuxConfig({
			getUploadUrl: mockGetUploadUrl,
			maxConcurrentUploads: 2,
			maxFiles: 10,
			validate,
		});

		expect(config.maxConcurrentUploads).toBe(2);
		expect(config.maxFiles).toBe(10);
		expect(config.validate).toBe(validate);
	});

	it("passes through onFileReady, onUploadFailed", () => {
		const onFileReady = vi.fn();
		const onUploadFailed = vi.fn();
		const config = createMuxConfig({
			getUploadUrl: mockGetUploadUrl,
			onFileReady,
			onUploadFailed,
		});

		expect(config.onFileReady).toBe(onFileReady);
		expect(config.onUploadFailed).toBe(onUploadFailed);
	});

	it("passes through errorMessages", () => {
		const errorMessages = {
			uploadFailed: "Upload error",
			processingFailed: "Processing error",
		};
		const config = createMuxConfig({
			getUploadUrl: mockGetUploadUrl,
			errorMessages,
		});

		expect(config.errorMessages).toBe(errorMessages);
	});

	it("passes through pollingIntervalMs to status checker", () => {
		const config = createMuxConfig({
			getUploadUrl: mockGetUploadUrl,
			getAssetStatus: mockGetAssetStatus,
			pollingIntervalMs: 10000,
		});

		expect(config.statusChecker).toBeInstanceOf(MuxStatusChecker);
	});
});
