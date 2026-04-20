import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FileRef } from "@hyperserve/upload";
import type { HyperserveUploadOptions } from "../types.js";
import type { BackgroundUploadModule } from "../adapter/hyperserve.native.js";
import { HyperserveAdapter } from "../adapter/hyperserve.native.js";

vi.mock("hyperserve-sdk/react-native", () => ({
	putVideoToStorage: vi.fn(),
}));

import { putVideoToStorage } from "hyperserve-sdk/react-native";

function makeFileRef(name = "test.mp4"): FileRef {
	return {
		platform: "native",
		name,
		size: 1024,
		type: "video/mp4",
		uri: "file:///tmp/test.mp4",
	};
}

const defaultOptions: HyperserveUploadOptions = {
	isPublic: true,
	resolutions: ["240p", "480p"],
};

const defaultUploadResult = {
	videoId: "video-123",
	uploadUrl: "https://storage.example.com/presigned",
	contentType: "video/mp4",
};

function makeConfig(overrides?: {
	createUpload?: () => Promise<typeof defaultUploadResult>;
	completeUpload?: (videoId: string) => Promise<void>;
}) {
	return {
		createUpload: vi.fn().mockResolvedValue(defaultUploadResult),
		completeUpload: vi.fn().mockResolvedValue(undefined),
		...overrides,
	};
}

function createAdapter(
	config = makeConfig(),
	bgUpload?: BackgroundUploadModule | null,
) {
	return new HyperserveAdapter(config, bgUpload);
}

describe("HyperserveAdapter (native) - sdk fallback", () => {
	beforeEach(() => {
		vi.mocked(putVideoToStorage).mockReset();
		vi.mocked(putVideoToStorage).mockResolvedValue(undefined);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("calls createUpload, putVideoToStorage, then completeUpload", async () => {
		const config = makeConfig();
		const adapter = createAdapter(config, null);
		const onProgress = vi.fn();
		const ac = new AbortController();

		const result = await adapter.upload(
			makeFileRef(),
			defaultOptions,
			{ onProgress },
			ac.signal,
		);

		expect(config.createUpload).toHaveBeenCalled();
		expect(putVideoToStorage).toHaveBeenCalledWith(
			expect.objectContaining({
				uploadUrl: defaultUploadResult.uploadUrl,
				contentType: defaultUploadResult.contentType,
				uri: "file:///tmp/test.mp4",
			}),
		);
		expect(config.completeUpload).toHaveBeenCalledWith("video-123");
		expect(result).toEqual({
			metadata: { isPublic: true },
			videoId: "video-123",
		});
	});

	it("passes onProgress and signal to putVideoToStorage", async () => {
		const config = makeConfig();
		const adapter = createAdapter(config, null);
		const onProgress = vi.fn();
		const ac = new AbortController();

		await adapter.upload(makeFileRef(), defaultOptions, { onProgress }, ac.signal);

		expect(putVideoToStorage).toHaveBeenCalledWith(
			expect.objectContaining({ onProgress, signal: ac.signal }),
		);
	});

	it("rejects on createUpload error", async () => {
		const config = makeConfig({
			createUpload: vi.fn().mockRejectedValue(new Error("Server error")),
		});
		const adapter = createAdapter(config, null);
		const ac = new AbortController();

		await expect(
			adapter.upload(makeFileRef(), defaultOptions, { onProgress: vi.fn() }, ac.signal),
		).rejects.toThrow("Server error");

		expect(putVideoToStorage).not.toHaveBeenCalled();
	});

	it("rejects on putVideoToStorage error", async () => {
		vi.mocked(putVideoToStorage).mockRejectedValue(
			new Error("Upload failed with status 500"),
		);
		const config = makeConfig();
		const adapter = createAdapter(config, null);
		const ac = new AbortController();

		await expect(
			adapter.upload(makeFileRef(), defaultOptions, { onProgress: vi.fn() }, ac.signal),
		).rejects.toThrow("Upload failed with status 500");

		expect(config.completeUpload).not.toHaveBeenCalled();
	});

	it("rejects on completeUpload error", async () => {
		const config = makeConfig({
			completeUpload: vi.fn().mockRejectedValue(new Error("Complete failed")),
		});
		const adapter = createAdapter(config, null);
		const ac = new AbortController();

		await expect(
			adapter.upload(makeFileRef(), defaultOptions, { onProgress: vi.fn() }, ac.signal),
		).rejects.toThrow("Complete failed");
	});
});

describe("HyperserveAdapter (native) - background upload", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	function createMockBgUpload() {
		type Listener = {
			event: string;
			uploadId: string;
			callback: (data: Record<string, unknown>) => void;
		};

		const listeners: Listener[] = [];
		const module: BackgroundUploadModule = {
			addListener: vi.fn(
				(
					event: string,
					uploadId: string,
					callback: (data: Record<string, unknown>) => void,
				) => {
					listeners.push({ callback, event, uploadId });
					return { remove: vi.fn() };
				},
			),
			cancelUpload: vi.fn(),
			startUpload: vi.fn().mockResolvedValue("upload-abc"),
		};

		return {
			emit(event: string, data: Record<string, unknown>) {
				for (const l of listeners) {
					if (l.event === event) l.callback(data);
				}
			},
			listeners,
			module,
		};
	}

	async function waitForListeners(bg: ReturnType<typeof createMockBgUpload>) {
		await vi.waitFor(() => {
			expect(bg.module.addListener).toHaveBeenCalled();
		});
	}

	it("calls createUpload then does a raw PUT to presigned URL", async () => {
		const config = makeConfig();
		const bg = createMockBgUpload();
		const adapter = createAdapter(config, bg.module);
		const ac = new AbortController();

		const promise = adapter.upload(
			makeFileRef(),
			defaultOptions,
			{ onProgress: vi.fn() },
			ac.signal,
		);

		await vi.waitFor(() => expect(config.createUpload).toHaveBeenCalled());
		await waitForListeners(bg);

		const startUploadArgs = (
			bg.module.startUpload as ReturnType<typeof vi.fn>
		).mock.calls[0][0];

		expect(startUploadArgs).toMatchObject({
			headers: { "Content-Type": "video/mp4" },
			method: "PUT",
			type: "raw",
			url: defaultUploadResult.uploadUrl,
			path: "file:///tmp/test.mp4",
		});

		bg.emit("completed", { responseCode: 200 });

		const result = await promise;
		expect(config.completeUpload).toHaveBeenCalledWith("video-123");
		expect(result).toEqual({
			metadata: { isPublic: true },
			videoId: "video-123",
		});
	});

	it("reports progress", async () => {
		const bg = createMockBgUpload();
		const adapter = createAdapter(makeConfig(), bg.module);
		const onProgress = vi.fn();
		const ac = new AbortController();

		const promise = adapter.upload(
			makeFileRef(),
			defaultOptions,
			{ onProgress },
			ac.signal,
		);

		await waitForListeners(bg);

		bg.emit("progress", { progress: 50 });
		expect(onProgress).toHaveBeenCalledWith(50);

		bg.emit("completed", { responseCode: 200 });
		await promise;
	});

	it("rejects on background upload error", async () => {
		const bg = createMockBgUpload();
		const adapter = createAdapter(makeConfig(), bg.module);
		const ac = new AbortController();

		const promise = adapter.upload(
			makeFileRef(),
			defaultOptions,
			{ onProgress: vi.fn() },
			ac.signal,
		);

		await waitForListeners(bg);
		bg.emit("error", { error: "Connection lost" });

		await expect(promise).rejects.toThrow("Connection lost");
	});

	it("rejects on non-2xx S3 response", async () => {
		const bg = createMockBgUpload();
		const adapter = createAdapter(makeConfig(), bg.module);
		const ac = new AbortController();

		const promise = adapter.upload(
			makeFileRef(),
			defaultOptions,
			{ onProgress: vi.fn() },
			ac.signal,
		);

		await waitForListeners(bg);
		bg.emit("completed", { responseCode: 403 });

		await expect(promise).rejects.toThrow("Upload failed with status 403");
	});

	it("rejects if completeUpload throws after S3 success", async () => {
		const config = makeConfig({
			completeUpload: vi.fn().mockRejectedValue(new Error("Complete failed")),
		});
		const bg = createMockBgUpload();
		const adapter = createAdapter(config, bg.module);
		const ac = new AbortController();

		const promise = adapter.upload(
			makeFileRef(),
			defaultOptions,
			{ onProgress: vi.fn() },
			ac.signal,
		);

		await waitForListeners(bg);
		bg.emit("completed", { responseCode: 200 });

		await expect(promise).rejects.toThrow("Complete failed");
	});

	it("cancels upload on abort signal", async () => {
		const bg = createMockBgUpload();
		const adapter = createAdapter(makeConfig(), bg.module);
		const ac = new AbortController();

		const promise = adapter.upload(
			makeFileRef(),
			defaultOptions,
			{ onProgress: vi.fn() },
			ac.signal,
		);

		await waitForListeners(bg);
		ac.abort();

		await expect(promise).rejects.toThrow("Upload aborted");
		expect(bg.module.cancelUpload).toHaveBeenCalledWith("upload-abc");
	});

	it("rejects if startUpload itself fails", async () => {
		const bg = createMockBgUpload();
		(bg.module.startUpload as ReturnType<typeof vi.fn>).mockRejectedValue(
			new Error("Permission denied"),
		);

		const adapter = createAdapter(makeConfig(), bg.module);
		const ac = new AbortController();

		await expect(
			adapter.upload(
				makeFileRef(),
				defaultOptions,
				{ onProgress: vi.fn() },
				ac.signal,
			),
		).rejects.toThrow("Permission denied");
	});
});
