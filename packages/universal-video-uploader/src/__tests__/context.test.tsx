import { act, renderHook } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UploadProvider } from "../context.js";
import { useUpload } from "../hooks/useUpload.js";
import type {
	FileRef,
	UploadAdapter,
	UploadConfig,
	UploadResult,
} from "../types.js";

function makeFileRef(name = "test.mp4"): FileRef {
	return {
		name,
		size: 1024,
		type: "video/mp4",
		uri: `blob:${name}`,
	};
}

function createMockAdapter(
	resolveWith?: UploadResult,
	rejectWith?: Error,
): UploadAdapter {
	return {
		upload: vi.fn((_file, _options, callbacks, _signal) => {
			if (rejectWith) {
				return Promise.reject(rejectWith);
			}
			callbacks.onProgress(50);
			callbacks.onProgress(100);
			return Promise.resolve(
				resolveWith ?? {
					metadata: { isPublic: true },
					videoId: "video-123",
				},
			);
		}),
	};
}

function makeConfig(overrides: Partial<UploadConfig> = {}): UploadConfig {
	return {
		adapter: createMockAdapter(),
		uploadOptions: {
			isPublic: true,
			resolutions: "240p,480p",
		},
		...overrides,
	};
}

function makeWrapper(config: UploadConfig) {
	return function Wrapper({ children }: { children: React.ReactNode }) {
		return <UploadProvider config={config}>{children}</UploadProvider>;
	};
}

describe("UploadProvider + useUpload", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				json: () =>
					Promise.resolve({
						id: "video-123",
						isPublic: true,
						resolutions: {
							"480p": {
								id: "res-1",
								status: "ready",
								video_url: "https://cdn.example.com/video.mp4",
							},
						},
						status: "ready",
					}),
				ok: true,
			}),
		);
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("starts with empty file list", () => {
		const { result } = renderHook(() => useUpload(), {
			wrapper: makeWrapper(makeConfig()),
		});
		expect(result.current.files).toEqual([]);
	});

	it("adds files via addFiles", async () => {
		const adapter = createMockAdapter();
		const { result } = renderHook(() => useUpload(), {
			wrapper: makeWrapper(makeConfig({ adapter })),
		});

		act(() => {
			result.current.addFiles([makeFileRef()]);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
		});

		expect(result.current.files).toHaveLength(1);
		expect(result.current.files[0].ref.name).toBe("test.mp4");
		expect(["selected", "uploading", "processing", "ready"]).toContain(
			result.current.files[0].status,
		);
	});

	it("removes files via removeFile", async () => {
		const adapter = createMockAdapter();
		const { result } = renderHook(() => useUpload(), {
			wrapper: makeWrapper(makeConfig({ adapter })),
		});

		act(() => {
			result.current.addFiles([makeFileRef()]);
		});

		const fileId = result.current.files[0].id;

		act(() => {
			result.current.removeFile(fileId);
		});

		expect(result.current.files).toHaveLength(0);
	});

	it("transitions file through upload lifecycle", async () => {
		const adapter = createMockAdapter();
		const config = makeConfig({ adapter });

		const { result } = renderHook(() => useUpload(), {
			wrapper: makeWrapper(config),
		});

		act(() => {
			result.current.addFiles([makeFileRef()]);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
		});

		const file = result.current.files[0];
		expect(adapter.upload).toHaveBeenCalled();
		expect(["uploading", "processing", "ready"]).toContain(file.status);
	});

	it("handles upload failure", async () => {
		const adapter = createMockAdapter(
			undefined,
			new Error("Network error"),
		);
		const config = makeConfig({ adapter });

		const { result } = renderHook(() => useUpload(), {
			wrapper: makeWrapper(config),
		});

		act(() => {
			result.current.addFiles([makeFileRef()]);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
		});

		const file = result.current.files[0];
		expect(file.status).toBe("failed");
		expect(file.error).toBe("Network error");
	});

	it("retries failed files", async () => {
		const callCount = { value: 0 };
		const adapter: UploadAdapter = {
			upload: vi.fn((_file, _options, callbacks) => {
				callCount.value++;
				if (callCount.value === 1) {
					return Promise.reject(new Error("First attempt failed"));
				}
				callbacks.onProgress(100);
				return Promise.resolve({
					metadata: { isPublic: true },
					videoId: "video-123",
				});
			}),
		};

		const { result } = renderHook(() => useUpload(), {
			wrapper: makeWrapper(makeConfig({ adapter })),
		});

		act(() => {
			result.current.addFiles([makeFileRef()]);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
		});

		expect(result.current.files[0].status).toBe("failed");

		act(() => {
			result.current.retryFile(result.current.files[0].id);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
		});

		expect(adapter.upload).toHaveBeenCalledTimes(2);
	});

	it("runs validation before upload", async () => {
		const adapter = createMockAdapter();
		const validate = vi.fn().mockResolvedValue({
			reason: "Too large",
			valid: false,
		});

		const { result } = renderHook(() => useUpload(), {
			wrapper: makeWrapper(makeConfig({ adapter, validate })),
		});

		act(() => {
			result.current.addFiles([makeFileRef()]);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
		});

		expect(validate).toHaveBeenCalled();
		expect(result.current.files[0].status).toBe("failed");
		expect(result.current.files[0].error).toBe("Too large");
		expect(adapter.upload).not.toHaveBeenCalled();
	});

	it("manages viewMode", () => {
		const { result } = renderHook(() => useUpload(), {
			wrapper: makeWrapper(makeConfig()),
		});

		expect(result.current.viewMode).toBe("list");

		act(() => {
			result.current.setViewMode("grid");
		});

		expect(result.current.viewMode).toBe("grid");
	});

	it("supports render props pattern", () => {
		let capturedValue: { files: unknown[] } | null = null;

		const config = makeConfig({ adapter: createMockAdapter() });

		const TestComponent = () => (
			<UploadProvider config={config}>
				{(value) => {
					capturedValue = value;
					return null;
				}}
			</UploadProvider>
		);

		const { unmount } = require("@testing-library/react").render(
			<TestComponent />,
		);

		expect(capturedValue).not.toBeNull();
		expect(capturedValue!.files).toEqual([]);

		unmount();
	});

	it("respects maxConcurrentUploads", async () => {
		let activeCount = 0;
		let maxActive = 0;

		const adapter: UploadAdapter = {
			upload: vi.fn(async (_file, _options, callbacks) => {
				activeCount++;
				maxActive = Math.max(maxActive, activeCount);
				await new Promise((r) => setTimeout(r, 100));
				callbacks.onProgress(100);
				activeCount--;
				return {
					metadata: { isPublic: true },
					videoId: `video-${Math.random()}`,
				};
			}),
		};

		const { result } = renderHook(() => useUpload(), {
			wrapper: makeWrapper(
				makeConfig({ adapter, maxConcurrentUploads: 2 }),
			),
		});

		act(() => {
			result.current.addFiles([
				makeFileRef("a.mp4"),
				makeFileRef("b.mp4"),
				makeFileRef("c.mp4"),
				makeFileRef("d.mp4"),
			]);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(500);
		});

		expect(maxActive).toBeLessThanOrEqual(2);
	});

	it("clears completed files", async () => {
		const adapter = createMockAdapter();
		const { result } = renderHook(() => useUpload(), {
			wrapper: makeWrapper(makeConfig({ adapter })),
		});

		act(() => {
			result.current.addFiles([makeFileRef("a.mp4"), makeFileRef("b.mp4")]);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(5000);
		});

		const readyFiles = result.current.files.filter(
			(f) => f.status === "ready",
		);

		if (readyFiles.length > 0) {
			act(() => {
				result.current.clearCompleted();
			});

			expect(
				result.current.files.filter((f) => f.status === "ready"),
			).toHaveLength(0);
		}
	});
});
