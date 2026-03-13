import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HyperserveAdapter } from "../adapter/hyperserve.js";
import type { FileRef, HyperserveUploadOptions } from "../types.js";

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

const defaultOptions: HyperserveUploadOptions = {
	isPublic: true,
	resolutions: "240p,480p",
};

const defaultConfig = {
	apiKey: "test-api-key",
	baseUrl: "https://api.example.com",
};

function createAdapter() {
	return new HyperserveAdapter(defaultConfig);
}

class MockXHR {
	static instances: MockXHR[] = [];

	method = "";
	url = "";
	headers: Record<string, string> = {};
	body: FormData | null = null;
	status = 0;
	responseText = "";
	readyState = 0;

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
	send = vi.fn((body: FormData) => {
		this.body = body;
	});
	abort = vi.fn();

	constructor() {
		MockXHR.instances.push(this);
	}

	simulateLoad(status: number, responseText: string) {
		this.status = status;
		this.responseText = responseText;
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

describe("HyperserveAdapter (web)", () => {
	beforeEach(() => {
		MockXHR.instances = [];
		vi.stubGlobal("XMLHttpRequest", MockXHR);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("sends multipart form data with correct headers", async () => {
		const adapter = createAdapter();
		const ac = new AbortController();
		const onProgress = vi.fn();

		const uploadPromise = adapter.upload(
			makeFileRef(),
			defaultOptions,
			{ onProgress },
			ac.signal,
		);

		const xhr = MockXHR.instances[0];

		expect(xhr.method).toBe("POST");
		expect(xhr.url).toBe("https://api.example.com/video");
		expect(xhr.headers["X-API-KEY"]).toBe("test-api-key");

		xhr.simulateLoad(
			200,
			JSON.stringify({ id: "video-123", isPublic: true }),
		);

		const result = await uploadPromise;
		expect(result).toEqual({
			metadata: { isPublic: true },
			videoId: "video-123",
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

		const xhr = MockXHR.instances[0];
		xhr.simulateProgress(50, 100);
		expect(onProgress).toHaveBeenCalledWith(50);

		xhr.simulateProgress(100, 100);
		expect(onProgress).toHaveBeenCalledWith(100);

		xhr.simulateLoad(
			200,
			JSON.stringify({ id: "video-123", isPublic: true }),
		);

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

		const xhr = MockXHR.instances[0];
		xhr.simulateLoad(400, "Bad request");

		await expect(uploadPromise).rejects.toThrow("Upload failed with status 400");
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

		const xhr = MockXHR.instances[0];
		xhr.simulateError();

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

	it("includes optional fields in form data", async () => {
		const adapter = createAdapter();
		const ac = new AbortController();

		const uploadPromise = adapter.upload(
			makeFileRef(),
			{
				...defaultOptions,
				customUserMetadata: { tag: "test" },
				thumbnailTimestamps: "1,5",
			},
			{ onProgress: vi.fn() },
			ac.signal,
		);

		const xhr = MockXHR.instances[0];
		const formData = xhr.body;

		expect(formData).toBeInstanceOf(FormData);
		expect(formData?.get("thumbnail_timestamps_seconds")).toBe("1,5");
		expect(formData?.get("custom_user_metadata")).toBe(
			JSON.stringify({ tag: "test" }),
		);

		xhr.simulateLoad(
			200,
			JSON.stringify({ id: "video-123", isPublic: true }),
		);

		await uploadPromise;
	});
});
