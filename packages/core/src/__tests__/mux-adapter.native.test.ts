import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FileRef, MuxUploadOptions } from "../types.js";
import type { BackgroundUploadModule } from "../platform/backgroundUpload.native.js";
import { MuxAdapter } from "../adapter/mux.native.js";

function makeFileRef(name = "test.mp4"): FileRef {
	return {
		platform: "native",
		name,
		size: 1024,
		type: "video/mp4",
		uri: "file:///tmp/test.mp4",
	};
}

const defaultOptions: MuxUploadOptions = { passthrough: "post-123" };

const mockGetUploadUrl = vi.fn().mockResolvedValue({
	url: "https://storage.googleapis.com/mux-uploads/abc123",
	id: "upload-xyz",
});

function createAdapter(
	bgUpload?: BackgroundUploadModule | null,
	getUploadUrl = mockGetUploadUrl,
) {
	return new MuxAdapter({ getUploadUrl }, bgUpload);
}

describe("MuxAdapter (native) - fetch fallback", () => {
	beforeEach(() => {
		mockGetUploadUrl.mockClear();
		vi.stubGlobal(
			"fetch",
			vi.fn()
				.mockResolvedValueOnce({
					blob: () =>
						Promise.resolve(new Blob(["video"], { type: "video/mp4" })),
				})
				.mockResolvedValueOnce({ ok: true }),
		);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("calls getUploadUrl then PUTs blob to the returned URL", async () => {
		const adapter = createAdapter(null);
		const onProgress = vi.fn();
		const ac = new AbortController();

		const result = await adapter.upload(
			makeFileRef(),
			defaultOptions,
			{ onProgress },
			ac.signal,
		);

		expect(mockGetUploadUrl).toHaveBeenCalledWith(defaultOptions);
		expect(result).toEqual({
			videoId: "upload-xyz",
			metadata: { uploadId: "upload-xyz" },
		});

		const fetchCalls = (fetch as ReturnType<typeof vi.fn>).mock.calls;
		expect(fetchCalls[0][0]).toBe("file:///tmp/test.mp4");
		expect(fetchCalls[1][0]).toBe(
			"https://storage.googleapis.com/mux-uploads/abc123",
		);
		expect(fetchCalls[1][1]).toMatchObject({
			method: "PUT",
			headers: { "Content-Type": "video/mp4" },
		});
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
			vi.fn()
				.mockResolvedValueOnce({
					blob: () =>
						Promise.resolve(new Blob(["video"], { type: "video/mp4" })),
				})
				.mockResolvedValueOnce({ ok: false, status: 500 }),
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
			(url: string, init?: RequestInit) => {
				if (url.startsWith("file://")) {
					return Promise.resolve({
						blob: () =>
							Promise.resolve(
								new Blob(["video"], { type: "video/mp4" }),
							),
					});
				}
				return new Promise((_resolve, reject) => {
					init?.signal?.addEventListener("abort", () =>
						reject(new Error("Aborted")),
					);
				});
			},
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

		await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
		ac.abort();

		await expect(promise).rejects.toThrow("Aborted");
	});

	it("rejects when getUploadUrl fails", async () => {
		const failingGetUrl = vi
			.fn()
			.mockRejectedValue(new Error("Auth failed"));
		const adapter = createAdapter(null, failingGetUrl);
		const ac = new AbortController();

		await expect(
			adapter.upload(
				makeFileRef(),
				defaultOptions,
				{ onProgress: vi.fn() },
				ac.signal,
			),
		).rejects.toThrow("Auth failed");
	});
});

describe("MuxAdapter (native) - background upload", () => {
	beforeEach(() => {
		mockGetUploadUrl.mockClear();
	});

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
			startUpload: vi.fn().mockResolvedValue("bg-upload-abc"),
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

	it("uses background upload module with raw PUT", async () => {
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

		bg.emit("completed", {});

		const result = await promise;
		expect(result).toEqual({
			videoId: "upload-xyz",
			metadata: { uploadId: "upload-xyz" },
		});
	});

	it("passes correct upload options to startUpload", async () => {
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

		const startUploadArgs = (
			bg.module.startUpload as ReturnType<typeof vi.fn>
		).mock.calls[0][0];

		expect(startUploadArgs).toMatchObject({
			headers: { "Content-Type": "video/mp4" },
			method: "PUT",
			path: "file:///tmp/test.mp4",
			type: "raw",
			url: "https://storage.googleapis.com/mux-uploads/abc123",
		});

		bg.emit("completed", {});
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
		expect(bg.module.cancelUpload).toHaveBeenCalledWith("bg-upload-abc");
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
