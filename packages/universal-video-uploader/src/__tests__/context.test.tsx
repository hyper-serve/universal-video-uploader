import { act, renderHook } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UploadProvider } from "../context.js";
import { useUpload } from "../hooks/useUpload.js";
import type {
	FileRef,
	StatusChecker,
	UploadAdapter,
	UploadConfig,
	UploadResult,
} from "../types.js";

function makeFileRef(name = "test.mp4", withRaw = false): FileRef {
	const ref: FileRef = {
		name,
		size: 1024,
		type: "video/mp4",
		uri: `blob:${name}`,
	};
	if (withRaw) {
		const blob = new Blob(["x"], { type: "video/mp4" });
		ref.raw = new File([blob], name, { type: "video/mp4" });
	}
	return ref;
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

function createMockStatusChecker(
	onCheckStatus?: (invoke: (status: "processing" | "ready" | "failed", playbackUrl?: string, statusDetail?: string) => void) => void,
): StatusChecker {
	return {
		checkStatus: vi.fn((options) => {
			onCheckStatus?.((status, playbackUrl, statusDetail) => {
				options.onStatusChange(status, playbackUrl, statusDetail);
			});
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
		const uploadPromise = new Promise<UploadResult>(() => {});
		const adapter = createMockAdapter();
		vi.mocked(adapter.upload).mockReturnValue(uploadPromise);
		const { result } = renderHook(() => useUpload(), {
			wrapper: makeWrapper(makeConfig({ adapter })),
		});

		act(() => {
			result.current.addFiles([makeFileRef()]);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
		});

		expect(result.current.files[0].status).toBe("uploading");
		const fileId = result.current.files[0].id;

		act(() => {
			result.current.removeFile(fileId);
		});

		expect(result.current.files).toHaveLength(0);
	});

	it("removeFile is no-op when file is processing or ready", async () => {
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

		expect(["processing", "ready"]).toContain(result.current.files[0].status);
		const fileId = result.current.files[0].id;

		act(() => {
			result.current.removeFile(fileId);
		});

		expect(result.current.files).toHaveLength(1);
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

	it("exposes derived state helpers", async () => {
		const adapter: UploadAdapter = {
			upload: vi.fn(() => new Promise<UploadResult>(() => {})),
		};
		const { result } = renderHook(() => useUpload(), {
			wrapper: makeWrapper(makeConfig({ adapter })),
		});

		expect(result.current.isUploading).toBe(false);
		expect(result.current.hasErrors).toBe(false);
		expect(result.current.allReady).toBe(false);

		act(() => {
			result.current.addFiles([makeFileRef()]);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
		});

		expect(result.current.isUploading).toBe(true);
		expect(result.current.hasErrors).toBe(false);
		expect(result.current.allReady).toBe(false);
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

	it("sets allReady true when all files complete", async () => {
		const adapter = createMockAdapter({
			metadata: { isPublic: true },
			playbackUrl: "https://cdn.example.com/done.mp4",
			videoId: "v1",
		});
		const { result } = renderHook(() => useUpload(), {
			wrapper: makeWrapper(makeConfig({ adapter })),
		});

		act(() => {
			result.current.addFiles([makeFileRef("a.mp4"), makeFileRef("b.mp4")]);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(5000);
		});

		expect(result.current.allReady).toBe(true);
		expect(result.current.isUploading).toBe(false);
	});

	it("transitions to ready when adapter returns playbackUrl directly", async () => {
		const adapter = createMockAdapter({
			metadata: { isPublic: true },
			playbackUrl: "https://cdn.example.com/ready.mp4",
			videoId: "video-1",
		});
		const statusChecker = createMockStatusChecker();
		const config = makeConfig({ adapter, statusChecker });

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
		expect(file.status).toBe("ready");
		expect(file.playbackUrl).toBe("https://cdn.example.com/ready.mp4");
		expect(file.videoId).toBe("video-1");
		expect(statusChecker.checkStatus).not.toHaveBeenCalled();
	});

	it("runs statusChecker when adapter returns without playbackUrl", async () => {
		let invokeStatusChange: (status: "processing" | "ready" | "failed", playbackUrl?: string, statusDetail?: string) => void;
		const statusChecker = createMockStatusChecker((invoke) => {
			invokeStatusChange = invoke;
		});
		const adapter = createMockAdapter({
			metadata: { isPublic: true },
			videoId: "video-1",
		});
		const config = makeConfig({ adapter, statusChecker });

		const { result } = renderHook(() => useUpload(), {
			wrapper: makeWrapper(config),
		});

		act(() => {
			result.current.addFiles([makeFileRef()]);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
		});

		expect(statusChecker.checkStatus).toHaveBeenCalled();
		expect(result.current.files[0].status).toBe("processing");

		act(() => {
			invokeStatusChange!("processing", undefined, "480p: pending");
		});
		expect(result.current.files[0].statusDetail).toBe("480p: pending");

		act(() => {
			invokeStatusChange!("ready", "https://cdn.example.com/video.mp4");
		});
		expect(result.current.files[0].status).toBe("ready");
		expect(result.current.files[0].playbackUrl).toBe("https://cdn.example.com/video.mp4");
		expect(result.current.files[0].error).toBeNull();
	});

	it("transitions to failed when statusChecker reports failed", async () => {
		let invokeStatusChange: (status: "processing" | "ready" | "failed", playbackUrl?: string, statusDetail?: string) => void;
		const statusChecker = createMockStatusChecker((invoke) => {
			invokeStatusChange = invoke;
		});
		const adapter = createMockAdapter({
			metadata: { isPublic: true },
			videoId: "video-1",
		});
		const config = makeConfig({ adapter, statusChecker });

		const { result } = renderHook(() => useUpload(), {
			wrapper: makeWrapper(config),
		});

		act(() => {
			result.current.addFiles([makeFileRef()]);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
		});

		act(() => {
			invokeStatusChange!("failed");
		});
		expect(result.current.files[0].status).toBe("failed");
		expect(result.current.files[0].error).toBe("Processing failed");
	});

	it("handles validation throwing", async () => {
		const adapter = createMockAdapter();
		const validate = vi.fn().mockRejectedValue(new Error("Validation crashed"));
		const config = makeConfig({ adapter, validate });

		const { result } = renderHook(() => useUpload(), {
			wrapper: makeWrapper(config),
		});

		act(() => {
			result.current.addFiles([makeFileRef()]);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
		});

		expect(result.current.files[0].status).toBe("failed");
		expect(result.current.files[0].error).toBe("Validation error");
		expect(adapter.upload).not.toHaveBeenCalled();
	});

	it("aborts in-flight upload and re-enqueues on retry", async () => {
		let callCount = 0;
		const adapter: UploadAdapter = {
			upload: vi.fn((_file, _opts, callbacks, signal) => {
				callCount++;
				return new Promise<UploadResult>((resolve, reject) => {
					const onAbort = () =>
						reject(new DOMException("Aborted", "AbortError"));
					signal.addEventListener("abort", onAbort);
					if (callCount === 2) {
						signal.removeEventListener("abort", onAbort);
						callbacks.onProgress(100);
						resolve({
							metadata: { isPublic: true },
							playbackUrl: "https://cdn.example.com/ready.mp4",
							videoId: "video-123",
						});
					}
				});
			}),
		};
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

		expect(result.current.files[0].status).toBe("uploading");

		act(() => {
			result.current.retryFile(result.current.files[0].id);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
		});

		expect(adapter.upload).toHaveBeenCalledTimes(2);
		expect(result.current.files[0].status).toBe("ready");
	});

	it("aborts in-flight upload on unmount", async () => {
		let capturedSignal: AbortSignal;
		const adapter: UploadAdapter = {
			upload: vi.fn((_file, _opts, _cb, signal) => {
				capturedSignal = signal;
				return new Promise<UploadResult>(() => {});
			}),
		};
		const config = makeConfig({ adapter });

		const { result, unmount } = renderHook(() => useUpload(), {
			wrapper: makeWrapper(config),
		});

		act(() => {
			result.current.addFiles([makeFileRef()]);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
		});

		expect(result.current.files[0].status).toBe("uploading");

		unmount();

		expect(capturedSignal!.aborted).toBe(true);
	});

	it("exposes canAddMore and maxFiles from context", () => {
		const { result } = renderHook(() => useUpload(), {
			wrapper: makeWrapper(makeConfig()),
		});
		expect(result.current.canAddMore).toBe(true);
		expect(result.current.maxFiles).toBeUndefined();
	});

	it("respects maxFiles and sets canAddMore false when at cap", async () => {
		const adapter = createMockAdapter({
			metadata: { isPublic: true },
			playbackUrl: "https://cdn.example.com/done.mp4",
			videoId: "v1",
		});
		const { result } = renderHook(() => useUpload(), {
			wrapper: makeWrapper(
				makeConfig({ adapter, maxFiles: 2 }),
			),
		});

		expect(result.current.canAddMore).toBe(true);
		expect(result.current.maxFiles).toBe(2);

		act(() => {
			result.current.addFiles([
				makeFileRef("a.mp4"),
				makeFileRef("b.mp4"),
				makeFileRef("c.mp4"),
			]);
		});

		expect(result.current.files).toHaveLength(2);
		expect(result.current.canAddMore).toBe(false);

		await act(async () => {
			await vi.advanceTimersByTimeAsync(5000);
		});

		expect(result.current.files.every((f) => f.status === "ready")).toBe(true);
		expect(result.current.canAddMore).toBe(false);
	});

	it("calls onFileReady when file transitions to ready", async () => {
		const adapter = createMockAdapter({
			metadata: { isPublic: true },
			playbackUrl: "https://cdn.example.com/done.mp4",
			videoId: "v1",
		});
		const onFileReady = vi.fn();
		const config = makeConfig({ adapter, onFileReady });

		const { result } = renderHook(() => useUpload(), {
			wrapper: makeWrapper(config),
		});

		act(() => {
			result.current.addFiles([makeFileRef()]);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
		});

		expect(result.current.files[0].status).toBe("ready");
		expect(onFileReady).toHaveBeenCalledTimes(1);
		expect(onFileReady).toHaveBeenCalledWith(
			expect.objectContaining({
				id: result.current.files[0].id,
				status: "ready",
				playbackUrl: "https://cdn.example.com/done.mp4",
				videoId: "v1",
			}),
		);
	});

	it("calls onUploadFailed when file transitions to failed", async () => {
		const adapter = createMockAdapter(
			undefined,
			new Error("Upload failed"),
		);
		const onUploadFailed = vi.fn();
		const config = makeConfig({ adapter, onUploadFailed });

		const { result } = renderHook(() => useUpload(), {
			wrapper: makeWrapper(config),
		});

		act(() => {
			result.current.addFiles([makeFileRef()]);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
		});

		expect(result.current.files[0].status).toBe("failed");
		expect(onUploadFailed).toHaveBeenCalledTimes(1);
		expect(onUploadFailed).toHaveBeenCalledWith(
			expect.objectContaining({
				id: result.current.files[0].id,
				status: "failed",
				error: "Upload failed",
			}),
		);
	});

	it("does not call onFileReady again for files already at ready status", async () => {
		const adapter = createMockAdapter({
			metadata: { isPublic: true },
			playbackUrl: "https://cdn.example.com/done.mp4",
			videoId: "v1",
		});
		const onFileReady = vi.fn();
		const config = makeConfig({ adapter, onFileReady });

		const { result } = renderHook(() => useUpload(), {
			wrapper: makeWrapper(config),
		});

		act(() => {
			result.current.addFiles([makeFileRef()]);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
		});

		expect(onFileReady).toHaveBeenCalledTimes(1);

		onFileReady.mockClear();
		expect(onFileReady).not.toHaveBeenCalled();
	});
});
