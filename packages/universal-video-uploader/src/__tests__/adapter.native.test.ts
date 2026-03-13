import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FileRef, HyperserveUploadOptions } from "../types.js";
import type { BackgroundUploadModule } from "../adapter/hyperserve.native.js";
import { HyperserveAdapter } from "../adapter/hyperserve.native.js";

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
	resolutions: "240p,480p",
};

const defaultConfig = {
	apiKey: "test-api-key",
	baseUrl: "https://api.example.com",
};

function createAdapter(bgUpload?: BackgroundUploadModule | null) {
	return new HyperserveAdapter(defaultConfig, bgUpload);
}

describe("HyperserveAdapter (native) - fetch fallback", () => {
	beforeEach(() => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				json: () =>
					Promise.resolve({ id: "video-123", isPublic: true }),
				ok: true,
			}),
		);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("uses fetch when no background upload module is available", async () => {
		const adapter = createAdapter(null);
		const onProgress = vi.fn();
		const ac = new AbortController();

		const result = await adapter.upload(
			makeFileRef(),
			defaultOptions,
			{ onProgress },
			ac.signal,
		);

		expect(result).toEqual({
			metadata: { isPublic: true },
			videoId: "video-123",
		});
		expect(fetch).toHaveBeenCalledWith(
			"https://api.example.com/video",
			expect.objectContaining({
				headers: { "X-API-KEY": "test-api-key" },
				method: "POST",
			}),
		);
	});

	it("reports progress as 50 then 100 in fetch fallback", async () => {
		const adapter = createAdapter(null);
		const onProgress = vi.fn();
		const ac = new AbortController();

		await adapter.upload(
			makeFileRef(),
			defaultOptions,
			{ onProgress },
			ac.signal,
		);

		expect(onProgress).toHaveBeenCalledWith(50);
		expect(onProgress).toHaveBeenCalledWith(100);
	});

	it("rejects on HTTP error", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({ ok: false, status: 500 }),
		);

		const adapter = createAdapter(null);
		const ac = new AbortController();

		await expect(
			adapter.upload(
				makeFileRef(),
				defaultOptions,
				{ onProgress: vi.fn() },
				ac.signal,
			),
		).rejects.toThrow("Upload failed with status 500");
	});

	it("passes abort signal to fetch", async () => {
		const fetchMock = vi.fn().mockImplementation(
			(_url: string, init: RequestInit) =>
				new Promise((_resolve, reject) => {
					init.signal?.addEventListener("abort", () =>
						reject(new Error("Aborted")),
					);
				}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const adapter = createAdapter(null);
		const ac = new AbortController();

		const promise = adapter.upload(
			makeFileRef(),
			defaultOptions,
			{ onProgress: vi.fn() },
			ac.signal,
		);

		ac.abort();

		await expect(promise).rejects.toThrow("Aborted");
	});

	it("includes optional fields in the form data", async () => {
		const adapter = createAdapter(null);
		const ac = new AbortController();

		await adapter.upload(
			makeFileRef(),
			{
				...defaultOptions,
				customUserMetadata: { tag: "test" },
				thumbnailTimestamps: "1,5",
			},
			{ onProgress: vi.fn() },
			ac.signal,
		);

		const fetchCall = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
		const body = fetchCall[1].body as FormData;
		expect(body.get("thumbnail_timestamps_seconds")).toBe("1,5");
		expect(body.get("custom_user_metadata")).toBe(
			JSON.stringify({ tag: "test" }),
		);
	});

	it("appends file as RN-style object in form data", async () => {
		const adapter = createAdapter(null);
		const ac = new AbortController();

		await adapter.upload(
			makeFileRef(),
			defaultOptions,
			{ onProgress: vi.fn() },
			ac.signal,
		);

		const fetchCall = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
		const body = fetchCall[1].body as FormData;
		expect(body.get("resolutions")).toBe("240p,480p");
		expect(body.get("isPublic")).toBe("true");
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

	it("uses background upload module when provided", async () => {
		const bg = createMockBgUpload();
		const adapter = createAdapter(bg.module);
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

		bg.emit("completed", {
			responseBody: JSON.stringify({
				id: "video-456",
				isPublic: true,
			}),
		});

		const result = await promise;
		expect(result).toEqual({
			metadata: { isPublic: true },
			videoId: "video-456",
		});
	});

	it("passes correct upload options to startUpload", async () => {
		const bg = createMockBgUpload();
		const adapter = createAdapter(bg.module);
		const ac = new AbortController();

		const promise = adapter.upload(
			makeFileRef(),
			{
				...defaultOptions,
				customUserMetadata: { foo: "bar" },
				thumbnailTimestamps: "2,4",
			},
			{ onProgress: vi.fn() },
			ac.signal,
		);

		await waitForListeners(bg);

		const startUploadArgs = (
			bg.module.startUpload as ReturnType<typeof vi.fn>
		).mock.calls[0][0];

		expect(startUploadArgs).toMatchObject({
			field: "file",
			headers: { "X-API-KEY": "test-api-key" },
			method: "POST",
			parameters: expect.objectContaining({
				isPublic: "true",
				resolutions: "240p,480p",
				thumbnail_timestamps_seconds: "2,4",
				custom_user_metadata: JSON.stringify({ foo: "bar" }),
			}),
			path: "file:///tmp/test.mp4",
			type: "multipart",
			url: "https://api.example.com/video",
		});

		bg.emit("completed", {
			responseBody: JSON.stringify({ id: "v", isPublic: true }),
		});

		await promise;
	});

	it("rejects on background upload error", async () => {
		const bg = createMockBgUpload();
		const adapter = createAdapter(bg.module);
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

	it("rejects with invalid response on malformed JSON", async () => {
		const bg = createMockBgUpload();
		const adapter = createAdapter(bg.module);
		const ac = new AbortController();

		const promise = adapter.upload(
			makeFileRef(),
			defaultOptions,
			{ onProgress: vi.fn() },
			ac.signal,
		);

		await waitForListeners(bg);

		bg.emit("completed", { responseBody: "not-json" });

		await expect(promise).rejects.toThrow("Invalid response from server");
	});

	it("cancels upload on abort signal", async () => {
		const bg = createMockBgUpload();
		const adapter = createAdapter(bg.module);
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

		const adapter = createAdapter(bg.module);
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
