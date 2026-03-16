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

	it("retries on HTTP error with backoff delay", async () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
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

		// first error backs off to intervalMs * 2^1 = 2000ms
		await vi.advanceTimersByTimeAsync(1999);
		expect(fetchMock).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(1);
		expect(onStatusChange).toHaveBeenCalledWith(
			"ready",
			"https://cdn.example.com/video.mp4",
		);
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it("retries on JSON parse error with backoff delay", async () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
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

		// first error backs off to intervalMs * 2^1 = 2000ms
		await vi.advanceTimersByTimeAsync(2000);
		expect(onStatusChange).toHaveBeenCalledWith("failed");
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it("backs off exponentially on consecutive errors", async () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const onStatusChange = vi.fn();
		const ac = new AbortController();

		const readyResponse = {
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
		};

		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({ ok: false, status: 500 }) // error 1 → backoff 2000ms
			.mockResolvedValueOnce({ ok: false, status: 500 }) // error 2 → backoff 4000ms
			.mockResolvedValueOnce({ ok: false, status: 500 }) // error 3 → backoff 8000ms
			.mockResolvedValueOnce(readyResponse);

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
		expect(fetchMock).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(2000);
		expect(fetchMock).toHaveBeenCalledTimes(2);

		await vi.advanceTimersByTimeAsync(4000);
		expect(fetchMock).toHaveBeenCalledTimes(3);

		await vi.advanceTimersByTimeAsync(8000);
		expect(fetchMock).toHaveBeenCalledTimes(4);
		expect(onStatusChange).toHaveBeenCalledWith(
			"ready",
			"https://cdn.example.com/video.mp4",
		);
	});

	it("resets backoff after a successful response", async () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const onStatusChange = vi.fn();
		const ac = new AbortController();

		const processingResponse = {
			json: () =>
				Promise.resolve({
					id: "video-1",
					isPublic: true,
					resolutions: {},
					status: "processing",
				}),
			ok: true,
		};
		const readyResponse = {
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
		};

		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({ ok: false, status: 500 }) // error → backoff 2000ms
			.mockResolvedValueOnce(processingResponse)          // success → resets to intervalMs 1000ms
			.mockResolvedValueOnce(readyResponse);

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
		expect(fetchMock).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(2000);
		expect(fetchMock).toHaveBeenCalledTimes(2);

		// backoff reset — next poll uses intervalMs (1000ms), not 4000ms
		await vi.advanceTimersByTimeAsync(1000);
		expect(fetchMock).toHaveBeenCalledTimes(3);
		expect(onStatusChange).toHaveBeenCalledWith(
			"ready",
			"https://cdn.example.com/video.mp4",
		);
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

	it("caps backoff at MAX_BACKOFF_MS (60 seconds)", async () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const onStatusChange = vi.fn();
		const ac = new AbortController();

		const readyResponse = {
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
		};

		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({ ok: false, status: 500 }) // 1 → 2000
			.mockResolvedValueOnce({ ok: false, status: 500 }) // 2 → 4000
			.mockResolvedValueOnce({ ok: false, status: 500 }) // 3 → 8000
			.mockResolvedValueOnce({ ok: false, status: 500 }) // 4 → 16000
			.mockResolvedValueOnce({ ok: false, status: 500 }) // 5 → 32000
			.mockResolvedValueOnce({ ok: false, status: 500 }) // 6 → 60000 (capped)
			.mockResolvedValueOnce(readyResponse);

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

		await vi.advanceTimersByTimeAsync(0); // 1st fetch
		await vi.advanceTimersByTimeAsync(2000); // 2nd
		await vi.advanceTimersByTimeAsync(4000); // 3rd
		await vi.advanceTimersByTimeAsync(8000); // 4th
		await vi.advanceTimersByTimeAsync(16000); // 5th
		await vi.advanceTimersByTimeAsync(32000); // 6th
		expect(fetchMock).toHaveBeenCalledTimes(6);
		// 7th should fire at 60000ms (capped), not 64000ms
		await vi.advanceTimersByTimeAsync(60000);
		expect(fetchMock).toHaveBeenCalledTimes(7);
		expect(onStatusChange).toHaveBeenCalledWith(
			"ready",
			"https://cdn.example.com/video.mp4",
		);
	});

	it("uses data.status as detail fallback when no resolutions in processing response", async () => {
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
						status: "encoding",
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
			"encoding",
		);
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

	it("defaults intervalMs to 3000 when not provided", async () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
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
						resolutions: {},
						status: "fail",
					}),
				ok: true,
			});

		vi.stubGlobal("fetch", fetchMock);

		const checker = new HyperserveStatusChecker({
			apiKey: "key",
			baseUrl: "https://api.example.com",
		});

		checker.checkStatus({
			onStatusChange,
			signal: ac.signal,
			uploadResult: { videoId: "video-1" },
		});

		await vi.advanceTimersByTimeAsync(0);
		expect(fetchMock).toHaveBeenCalledTimes(1);

		// Default is 3000ms, not 1000ms
		await vi.advanceTimersByTimeAsync(2999);
		expect(fetchMock).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(1);
		expect(fetchMock).toHaveBeenCalledTimes(2);
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
