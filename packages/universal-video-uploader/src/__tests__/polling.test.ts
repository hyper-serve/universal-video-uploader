import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pollVideoStatus } from "../polling/index.js";

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
		expect(onStatusChange).toHaveBeenCalledWith("processing");

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
});
