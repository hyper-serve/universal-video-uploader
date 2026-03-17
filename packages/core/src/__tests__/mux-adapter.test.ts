import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MuxAdapter } from "../adapter/mux.js";
import type { FileRef, MuxUploadOptions } from "../types.js";

function makeFileRef(): FileRef {
	const blob = new Blob(["fake video content"], { type: "video/mp4" });
	const file = new File([blob], "test.mp4", { type: "video/mp4" });
	return {
		platform: "web",
		name: "test.mp4",
		raw: file,
		size: file.size,
		type: "video/mp4",
		uri: "blob:test",
	};
}

const defaultOptions: MuxUploadOptions = { passthrough: "post-123" };

const mockGetUploadUrl = vi.fn().mockResolvedValue({
	url: "https://storage.googleapis.com/mux-uploads/abc123",
	id: "upload-xyz",
});

function createAdapter(getUploadUrl = mockGetUploadUrl) {
	return new MuxAdapter({ getUploadUrl });
}

class MockXHR {
	static instances: MockXHR[] = [];

	method = "";
	url = "";
	headers: Record<string, string> = {};
	body: unknown = null;
	status = 0;

	upload = {
		addEventListener: vi.fn(),
	};

	addEventListener = vi.fn();
	open = vi.fn((method: string, url: string) => {
		this.method = method;
		this.url = url;
	});
	setRequestHeader = vi.fn((key: string, value: string) => {
		this.headers[key] = value;
	});
	send = vi.fn((body: unknown) => {
		this.body = body;
	});
	abort = vi.fn();

	constructor() {
		MockXHR.instances.push(this);
	}

	simulateLoad(status: number) {
		this.status = status;
		const loadHandler = this.addEventListener.mock.calls.find(
			(c: unknown[]) => c[0] === "load",
		)?.[1];
		loadHandler?.();
	}

	simulateError() {
		const errorHandler = this.addEventListener.mock.calls.find(
			(c: unknown[]) => c[0] === "error",
		)?.[1];
		errorHandler?.();
	}

	simulateProgress(loaded: number, total: number) {
		const progressHandler = this.upload.addEventListener.mock.calls.find(
			(c: unknown[]) => c[0] === "progress",
		)?.[1];
		progressHandler?.({ lengthComputable: true, loaded, total });
	}
}

describe("MuxAdapter (web)", () => {
	beforeEach(() => {
		MockXHR.instances = [];
		vi.stubGlobal("XMLHttpRequest", MockXHR);
		mockGetUploadUrl.mockClear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("calls getUploadUrl with options and PUTs to the returned URL", async () => {
		const adapter = createAdapter();
		const ac = new AbortController();

		const uploadPromise = adapter.upload(
			makeFileRef(),
			defaultOptions,
			{ onProgress: vi.fn() },
			ac.signal,
		);

		expect(mockGetUploadUrl).toHaveBeenCalledWith(defaultOptions);

		await vi.waitFor(() => expect(MockXHR.instances.length).toBe(1));
		const xhr = MockXHR.instances[0];

		expect(xhr.method).toBe("PUT");
		expect(xhr.url).toBe(
			"https://storage.googleapis.com/mux-uploads/abc123",
		);
		expect(xhr.headers["Content-Type"]).toBe("video/mp4");
		expect(xhr.body).toBeInstanceOf(File);

		xhr.simulateLoad(200);

		const result = await uploadPromise;
		expect(result).toEqual({
			videoId: "upload-xyz",
			metadata: { uploadId: "upload-xyz" },
		});
	});

	it("reports progress", async () => {
		const adapter = createAdapter();
		const ac = new AbortController();
		const onProgress = vi.fn();

		const uploadPromise = adapter.upload(
			makeFileRef(),
			defaultOptions,
			{ onProgress },
			ac.signal,
		);

		await vi.waitFor(() => expect(MockXHR.instances.length).toBe(1));
		const xhr = MockXHR.instances[0];

		xhr.simulateProgress(30, 100);
		expect(onProgress).toHaveBeenCalledWith(30);

		xhr.simulateProgress(100, 100);
		expect(onProgress).toHaveBeenCalledWith(100);

		xhr.simulateLoad(200);
		await uploadPromise;
	});

	it("does not call onProgress when lengthComputable is false", async () => {
		const adapter = createAdapter();
		const ac = new AbortController();
		const onProgress = vi.fn();

		const uploadPromise = adapter.upload(
			makeFileRef(),
			defaultOptions,
			{ onProgress },
			ac.signal,
		);

		await vi.waitFor(() => expect(MockXHR.instances.length).toBe(1));
		const xhr = MockXHR.instances[0];

		const progressHandler = xhr.upload.addEventListener.mock.calls.find(
			(c: unknown[]) => c[0] === "progress",
		)?.[1];
		progressHandler?.({ lengthComputable: false, loaded: 50, total: 100 });
		expect(onProgress).not.toHaveBeenCalled();

		xhr.simulateLoad(200);
		await uploadPromise;
	});

	it("rejects on HTTP error", async () => {
		const adapter = createAdapter();
		const ac = new AbortController();

		const uploadPromise = adapter.upload(
			makeFileRef(),
			defaultOptions,
			{ onProgress: vi.fn() },
			ac.signal,
		);

		await vi.waitFor(() => expect(MockXHR.instances.length).toBe(1));
		MockXHR.instances[0].simulateLoad(500);

		await expect(uploadPromise).rejects.toThrow(
			"Upload failed with status 500",
		);
	});

	it("rejects on network error", async () => {
		const adapter = createAdapter();
		const ac = new AbortController();

		const uploadPromise = adapter.upload(
			makeFileRef(),
			defaultOptions,
			{ onProgress: vi.fn() },
			ac.signal,
		);

		await vi.waitFor(() => expect(MockXHR.instances.length).toBe(1));
		MockXHR.instances[0].simulateError();

		await expect(uploadPromise).rejects.toThrow("Network error");
	});

	it("rejects for native file ref", async () => {
		const adapter = createAdapter();
		const ac = new AbortController();
		const ref: FileRef = {
			platform: "native",
			name: "test.mp4",
			size: 1024,
			type: "video/mp4",
			uri: "file:///tmp/test.mp4",
		};

		await expect(
			adapter.upload(
				ref,
				defaultOptions,
				{ onProgress: vi.fn() },
				ac.signal,
			),
		).rejects.toThrow("File.raw is required");
	});

	it("aborts xhr when abort signal fires", async () => {
		const adapter = createAdapter();
		const ac = new AbortController();

		const uploadPromise = adapter.upload(
			makeFileRef(),
			defaultOptions,
			{ onProgress: vi.fn() },
			ac.signal,
		);

		await vi.waitFor(() => expect(MockXHR.instances.length).toBe(1));
		const xhr = MockXHR.instances[0];

		ac.abort();

		const abortHandler = xhr.addEventListener.mock.calls.find(
			(c: unknown[]) => c[0] === "abort",
		)?.[1];
		abortHandler?.();

		await expect(uploadPromise).rejects.toThrow("Upload aborted");
		expect(xhr.abort).toHaveBeenCalled();
	});

	it("rejects when getUploadUrl fails", async () => {
		const failingGetUrl = vi
			.fn()
			.mockRejectedValue(new Error("Auth failed"));
		const adapter = createAdapter(failingGetUrl);
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

	it("passes empty options when no passthrough", async () => {
		const adapter = createAdapter();
		const ac = new AbortController();

		const uploadPromise = adapter.upload(
			makeFileRef(),
			{},
			{ onProgress: vi.fn() },
			ac.signal,
		);

		expect(mockGetUploadUrl).toHaveBeenCalledWith({});

		await vi.waitFor(() => expect(MockXHR.instances.length).toBe(1));
		MockXHR.instances[0].simulateLoad(200);
		await uploadPromise;
	});
});
