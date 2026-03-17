import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MuxStatusChecker, pollMuxStatus } from "../polling/mux.js";

describe("pollMuxStatus", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("calls onStatusChange with 'ready' and playback URL when asset is ready", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();
		const getAssetStatus = vi.fn().mockResolvedValueOnce({
			status: "ready",
			playbackId: "playback-abc",
			assetId: "asset-123",
		});

		pollMuxStatus({
			getAssetStatus,
			intervalMs: 3000,
			onStatusChange,
			signal: ac.signal,
			uploadId: "upload-xyz",
		});

		await vi.advanceTimersByTimeAsync(0);

		expect(getAssetStatus).toHaveBeenCalledWith("upload-xyz");
		expect(onStatusChange).toHaveBeenCalledWith(
			"ready",
			"https://stream.mux.com/playback-abc.m3u8",
		);
	});

	it("calls onStatusChange with 'ready' and undefined when no playbackId", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();
		const getAssetStatus = vi.fn().mockResolvedValueOnce({
			status: "ready",
			assetId: "asset-123",
		});

		pollMuxStatus({
			getAssetStatus,
			intervalMs: 3000,
			onStatusChange,
			signal: ac.signal,
			uploadId: "upload-xyz",
		});

		await vi.advanceTimersByTimeAsync(0);

		expect(onStatusChange).toHaveBeenCalledWith("ready", undefined);
	});

	it("calls onStatusChange with 'failed' when asset errored", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();
		const getAssetStatus = vi.fn().mockResolvedValueOnce({
			status: "errored",
		});

		pollMuxStatus({
			getAssetStatus,
			intervalMs: 3000,
			onStatusChange,
			signal: ac.signal,
			uploadId: "upload-xyz",
		});

		await vi.advanceTimersByTimeAsync(0);

		expect(onStatusChange).toHaveBeenCalledWith("failed");
	});

	it("reports 'processing' with 'Waiting for upload' detail for waiting status", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();
		const getAssetStatus = vi
			.fn()
			.mockResolvedValueOnce({ status: "waiting" })
			.mockResolvedValueOnce({ status: "ready", playbackId: "p1" });

		pollMuxStatus({
			getAssetStatus,
			intervalMs: 2000,
			onStatusChange,
			signal: ac.signal,
			uploadId: "upload-xyz",
		});

		await vi.advanceTimersByTimeAsync(0);
		expect(onStatusChange).toHaveBeenCalledWith(
			"processing",
			undefined,
			"Waiting for upload",
		);

		await vi.advanceTimersByTimeAsync(2000);
		expect(onStatusChange).toHaveBeenCalledWith(
			"ready",
			"https://stream.mux.com/p1.m3u8",
		);
		expect(getAssetStatus).toHaveBeenCalledTimes(2);
	});

	it("reports 'processing' with 'Processing' detail for preparing status", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();
		const getAssetStatus = vi
			.fn()
			.mockResolvedValueOnce({ status: "preparing" })
			.mockResolvedValueOnce({ status: "ready", playbackId: "p2" });

		pollMuxStatus({
			getAssetStatus,
			intervalMs: 2000,
			onStatusChange,
			signal: ac.signal,
			uploadId: "upload-xyz",
		});

		await vi.advanceTimersByTimeAsync(0);
		expect(onStatusChange).toHaveBeenCalledWith(
			"processing",
			undefined,
			"Processing",
		);

		await vi.advanceTimersByTimeAsync(2000);
		expect(onStatusChange).toHaveBeenCalledWith(
			"ready",
			"https://stream.mux.com/p2.m3u8",
		);
	});

	it("stops polling when signal is aborted", async () => {
		const onStatusChange = vi.fn();
		const ac = new AbortController();
		const getAssetStatus = vi.fn().mockResolvedValue({ status: "preparing" });

		pollMuxStatus({
			getAssetStatus,
			intervalMs: 2000,
			onStatusChange,
			signal: ac.signal,
			uploadId: "upload-xyz",
		});

		await vi.advanceTimersByTimeAsync(0);
		ac.abort();
		await vi.advanceTimersByTimeAsync(10000);

		expect(getAssetStatus).toHaveBeenCalledTimes(1);
	});

	it("retries with backoff on errors", async () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const onStatusChange = vi.fn();
		const ac = new AbortController();
		const getAssetStatus = vi
			.fn()
			.mockRejectedValueOnce(new Error("Network error"))
			.mockResolvedValueOnce({ status: "ready", playbackId: "p3" });

		pollMuxStatus({
			getAssetStatus,
			intervalMs: 1000,
			onStatusChange,
			signal: ac.signal,
			uploadId: "upload-xyz",
		});

		await vi.advanceTimersByTimeAsync(0);
		expect(onStatusChange).not.toHaveBeenCalled();

		// first error backs off to intervalMs * 2^1 = 2000ms
		await vi.advanceTimersByTimeAsync(1999);
		expect(getAssetStatus).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(1);
		expect(onStatusChange).toHaveBeenCalledWith(
			"ready",
			"https://stream.mux.com/p3.m3u8",
		);
		expect(getAssetStatus).toHaveBeenCalledTimes(2);
	});

	it("backs off exponentially on consecutive errors", async () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const onStatusChange = vi.fn();
		const ac = new AbortController();
		const getAssetStatus = vi
			.fn()
			.mockRejectedValueOnce(new Error("fail"))  // 1 → backoff 2000ms
			.mockRejectedValueOnce(new Error("fail"))  // 2 → backoff 4000ms
			.mockRejectedValueOnce(new Error("fail"))  // 3 → backoff 8000ms
			.mockResolvedValueOnce({ status: "ready", playbackId: "p4" });

		pollMuxStatus({
			getAssetStatus,
			intervalMs: 1000,
			onStatusChange,
			signal: ac.signal,
			uploadId: "upload-xyz",
		});

		await vi.advanceTimersByTimeAsync(0);
		expect(getAssetStatus).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(2000);
		expect(getAssetStatus).toHaveBeenCalledTimes(2);

		await vi.advanceTimersByTimeAsync(4000);
		expect(getAssetStatus).toHaveBeenCalledTimes(3);

		await vi.advanceTimersByTimeAsync(8000);
		expect(getAssetStatus).toHaveBeenCalledTimes(4);
		expect(onStatusChange).toHaveBeenCalledWith(
			"ready",
			"https://stream.mux.com/p4.m3u8",
		);
	});

	it("resets backoff after a successful response", async () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const onStatusChange = vi.fn();
		const ac = new AbortController();
		const getAssetStatus = vi
			.fn()
			.mockRejectedValueOnce(new Error("fail"))        // error → backoff 2000ms
			.mockResolvedValueOnce({ status: "preparing" })   // success → resets to intervalMs 1000ms
			.mockResolvedValueOnce({ status: "ready", playbackId: "p5" });

		pollMuxStatus({
			getAssetStatus,
			intervalMs: 1000,
			onStatusChange,
			signal: ac.signal,
			uploadId: "upload-xyz",
		});

		await vi.advanceTimersByTimeAsync(0);
		expect(getAssetStatus).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(2000);
		expect(getAssetStatus).toHaveBeenCalledTimes(2);

		// backoff reset — next poll uses intervalMs (1000ms), not 4000ms
		await vi.advanceTimersByTimeAsync(1000);
		expect(getAssetStatus).toHaveBeenCalledTimes(3);
		expect(onStatusChange).toHaveBeenCalledWith(
			"ready",
			"https://stream.mux.com/p5.m3u8",
		);
	});
});

describe("MuxStatusChecker", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("passes uploadResult.videoId as uploadId to getAssetStatus", async () => {
		const getAssetStatus = vi.fn().mockResolvedValueOnce({
			status: "ready",
			playbackId: "p-abc",
		});
		const onStatusChange = vi.fn();
		const ac = new AbortController();

		const checker = new MuxStatusChecker({ getAssetStatus });

		checker.checkStatus({
			onStatusChange,
			signal: ac.signal,
			uploadResult: { videoId: "upload-999" },
		});

		await vi.advanceTimersByTimeAsync(0);

		expect(getAssetStatus).toHaveBeenCalledWith("upload-999");
		expect(onStatusChange).toHaveBeenCalledWith(
			"ready",
			"https://stream.mux.com/p-abc.m3u8",
		);
	});

	it("defaults intervalMs to 5000 when not provided", async () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const getAssetStatus = vi
			.fn()
			.mockResolvedValueOnce({ status: "preparing" })
			.mockResolvedValueOnce({ status: "ready", playbackId: "p-def" });
		const onStatusChange = vi.fn();
		const ac = new AbortController();

		const checker = new MuxStatusChecker({ getAssetStatus });

		checker.checkStatus({
			onStatusChange,
			signal: ac.signal,
			uploadResult: { videoId: "upload-1" },
		});

		await vi.advanceTimersByTimeAsync(0);
		expect(getAssetStatus).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(4999);
		expect(getAssetStatus).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(1);
		expect(getAssetStatus).toHaveBeenCalledTimes(2);
	});

	it("uses custom intervalMs when provided", async () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const getAssetStatus = vi
			.fn()
			.mockResolvedValueOnce({ status: "preparing" })
			.mockResolvedValueOnce({ status: "ready", playbackId: "p-ghi" });
		const onStatusChange = vi.fn();
		const ac = new AbortController();

		const checker = new MuxStatusChecker({
			getAssetStatus,
			intervalMs: 1000,
		});

		checker.checkStatus({
			onStatusChange,
			signal: ac.signal,
			uploadResult: { videoId: "upload-2" },
		});

		await vi.advanceTimersByTimeAsync(0);
		expect(getAssetStatus).toHaveBeenCalledTimes(1);

		await vi.advanceTimersByTimeAsync(1000);
		expect(getAssetStatus).toHaveBeenCalledTimes(2);
	});
});
