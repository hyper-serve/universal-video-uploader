import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	HyperserveStatusChecker,
	pollVideoStatus,
} from "../polling/index.js";

describe("pollVideoStatus", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("calls onStatusChange with 'ready' and playbackUrl when video is ready", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();

		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValueOnce({
				json: () =>
					Promise.resolve({
						id: "video-1",
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

		pollVideoStatus({
			apiKey: "test-key",
			baseUrl: "https://api.example.com",
			intervalMs: 1000,
			isPublic: true,
			onStatusChange,
			signal: ac.signal,
			videoId: "video-1",
		});

		await vi.advanceTimersByTimeAsync(0);

		expect(onStatusChange).toHaveBeenCalledWith(
			"ready",
			"https://cdn.example.com/video.mp4",
		);
		expect(fetch).toHaveBeenCalledWith(
			"https://api.example.com/video/video-1/public",
			expect.objectContaining({
				headers: { "X-API-KEY": "test-key" },
			}),
		);
	});

	it("calls onStatusChange with 'failed' when video fails", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();

		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValueOnce({
				json: () =>
					Promise.resolve({
						id: "video-1",
						isPublic: true,
						resolutions: {},
						status: "fail",
					}),
				ok: true,
			}),
		);

		pollVideoStatus({
			apiKey: "test-key",
			baseUrl: "https://api.example.com",
			intervalMs: 1000,
			isPublic: true,
			onStatusChange,
			signal: ac.signal,
			videoId: "video-1",
		});

		await vi.advanceTimersByTimeAsync(0);

		expect(onStatusChange).toHaveBeenCalledWith("failed");
	});

	it("continues polling when status is pending", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();

		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({
				json: () =>
					Promise.resolve({
						id: "video-1",
						isPublic: true,
						resolutions: {},
						status: "pending",
					}),
				ok: true,
			})
			.mockResolvedValueOnce({
				json: () =>
					Promise.resolve({
						id: "video-1",
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
			});

		vi.stubGlobal("fetch", fetchMock);

		pollVideoStatus({
			apiKey: "test-key",
			baseUrl: "https://api.example.com",
			intervalMs: 2000,
			isPublic: true,
			onStatusChange,
			signal: ac.signal,
			videoId: "video-1",
		});

		await vi.advanceTimersByTimeAsync(0);
		expect(onStatusChange).toHaveBeenCalledWith(
			"processing",
			undefined,
			"pending",
		);

		await vi.advanceTimersByTimeAsync(2000);
		expect(onStatusChange).toHaveBeenCalledWith(
			"ready",
			"https://cdn.example.com/video.mp4",
		);
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it("uses private endpoint for private videos", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();

		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValueOnce({
				json: () =>
					Promise.resolve({
						id: "video-1",
						isPublic: false,
						resolutions: {},
						status: "fail",
					}),
				ok: true,
			}),
		);

		pollVideoStatus({
			apiKey: "test-key",
			baseUrl: "https://api.example.com",
			intervalMs: 1000,
			isPublic: false,
			onStatusChange,
			signal: ac.signal,
			videoId: "video-1",
		});

		await vi.advanceTimersByTimeAsync(0);

		expect(fetch).toHaveBeenCalledWith(
			"https://api.example.com/video/video-1/private/3600",
			expect.any(Object),
		);
	});

	it("stops polling when signal is aborted", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();

		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				json: () =>
					Promise.resolve({
						id: "video-1",
						isPublic: true,
						resolutions: {},
						status: "pending",
					}),
				ok: true,
			}),
		);

		pollVideoStatus({
			apiKey: "test-key",
			baseUrl: "https://api.example.com",
			intervalMs: 1000,
			isPublic: true,
			onStatusChange,
			signal: ac.signal,
			videoId: "video-1",
		});

		await vi.advanceTimersByTimeAsync(0);
		ac.abort();
		await vi.advanceTimersByTimeAsync(5000);

		expect(fetch).toHaveBeenCalledTimes(1);
	});

	it("retries on HTTP error", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();

		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({ ok: false, status: 500 })
			.mockResolvedValueOnce({
				json: () =>
					Promise.resolve({
						id: "video-1",
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
			});

		vi.stubGlobal("fetch", fetchMock);

		pollVideoStatus({
			apiKey: "test-key",
			baseUrl: "https://api.example.com",
			intervalMs: 1000,
			isPublic: true,
			onStatusChange,
			signal: ac.signal,
			videoId: "video-1",
		});

		await vi.advanceTimersByTimeAsync(0);
		expect(onStatusChange).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(1000);
		expect(onStatusChange).toHaveBeenCalledWith(
			"ready",
			"https://cdn.example.com/video.mp4",
		);
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it("retries on JSON parse error", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();

		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({
				json: () => Promise.reject(new Error("Invalid JSON")),
				ok: true,
			})
			.mockResolvedValueOnce({
				json: () =>
					Promise.resolve({
						id: "video-1",
						isPublic: true,
						resolutions: {},
						status: "fail",
					}),
				ok: true,
			});

		vi.stubGlobal("fetch", fetchMock);

		pollVideoStatus({
			apiKey: "test-key",
			baseUrl: "https://api.example.com",
			intervalMs: 1000,
			isPublic: true,
			onStatusChange,
			signal: ac.signal,
			videoId: "video-1",
		});

		await vi.advanceTimersByTimeAsync(0);
		expect(onStatusChange).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(1000);
		expect(onStatusChange).toHaveBeenCalledWith("failed");
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it("calls onStatusChange with ready and undefined playbackUrl when no video_url", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();

		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValueOnce({
				json: () =>
					Promise.resolve({
						id: "video-1",
						isPublic: true,
						resolutions: {
							"480p": { id: "res-1", status: "ready" },
						},
						status: "ready",
					}),
				ok: true,
			}),
		);

		pollVideoStatus({
			apiKey: "test-key",
			baseUrl: "https://api.example.com",
			intervalMs: 1000,
			isPublic: true,
			onStatusChange,
			signal: ac.signal,
			videoId: "video-1",
		});

		await vi.advanceTimersByTimeAsync(0);

		expect(onStatusChange).toHaveBeenCalledWith("ready", undefined);
	});

	it("includes resolution statuses in statusDetail when processing", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();

		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValueOnce({
				json: () =>
					Promise.resolve({
						id: "video-1",
						isPublic: true,
						resolutions: {
							"480p": { id: "r1", status: "pending" },
							"1080p": { id: "r2", status: "transcoding" },
						},
						status: "processing",
					}),
				ok: true,
			}),
		);

		pollVideoStatus({
			apiKey: "test-key",
			baseUrl: "https://api.example.com",
			intervalMs: 1000,
			isPublic: true,
			onStatusChange,
			signal: ac.signal,
			videoId: "video-1",
		});

		await vi.advanceTimersByTimeAsync(0);

		expect(onStatusChange).toHaveBeenCalledWith(
			"processing",
			undefined,
			"480p: pending, 1080p: transcoding",
		);
	});
});

describe("HyperserveStatusChecker", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("calls pollVideoStatus with videoId and derives isPublic from metadata", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();

		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValueOnce({
				json: () =>
					Promise.resolve({
						id: "video-99",
						isPublic: false,
						resolutions: {},
						status: "fail",
					}),
				ok: true,
			}),
		);

		const checker = new HyperserveStatusChecker({
			apiKey: "key",
			baseUrl: "https://api.example.com",
			intervalMs: 2000,
		});

		checker.checkStatus({
			onStatusChange,
			signal: ac.signal,
			uploadResult: {
				metadata: { isPublic: false },
				videoId: "video-99",
			},
		});

		await vi.advanceTimersByTimeAsync(0);

		expect(fetch).toHaveBeenCalledWith(
			"https://api.example.com/video/video-99/private/3600",
			expect.any(Object),
		);
	});

	it("defaults isPublic to true when metadata missing", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();

		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValueOnce({
				json: () =>
					Promise.resolve({
						id: "video-x",
						isPublic: true,
						resolutions: {},
						status: "fail",
					}),
				ok: true,
			}),
		);

		const checker = new HyperserveStatusChecker({
			apiKey: "key",
			baseUrl: "https://api.example.com",
		});

		checker.checkStatus({
			onStatusChange,
			signal: ac.signal,
			uploadResult: { videoId: "video-x" },
		});

		await vi.advanceTimersByTimeAsync(0);

		expect(fetch).toHaveBeenCalledWith(
			"https://api.example.com/video/video-x/public",
			expect.any(Object),
		);
	});
});
