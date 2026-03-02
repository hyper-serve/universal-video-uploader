import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { maxDuration } from "../validation/maxDuration.js";
import type { FileRef } from "../types.js";

function makeFileRef(overrides: Partial<FileRef> = {}): FileRef {
	const blob = new Blob(["x"], { type: "video/mp4" });
	return {
		name: "test.mp4",
		size: 1024,
		type: "video/mp4",
		uri: "blob:test",
		raw: new File([blob], "test.mp4", { type: "video/mp4" }),
		...overrides,
	};
}

function createMockVideo(duration: number, shouldError = false) {
	const video = {
		preload: "",
		duration: 0,
		onloadedmetadata: null as (() => void) | null,
		onerror: null as (() => void) | null,
		_src: "",
		set src(val: string) {
			this._src = val;
			queueMicrotask(() => {
				if (shouldError) {
					this.onerror?.();
				} else {
					(this as { duration: number }).duration = duration;
					this.onloadedmetadata?.();
				}
			});
		},
		get src() {
			return this._src;
		},
	};
	return video;
}

describe("maxDuration (web)", () => {
	beforeEach(() => {
		vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
			if (tagName === "video") {
				return createMockVideo(30) as unknown as HTMLVideoElement;
			}
			return document.createElement(tagName);
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("returns valid when file.raw is absent", () => {
		const validator = maxDuration(60);
		const ref = makeFileRef({ raw: undefined });
		// @ts-expect-error - raw is intentionally omitted
		delete ref.raw;

		const result = validator(ref);

		expect(result).toEqual({ valid: true });
		expect(document.createElement).not.toHaveBeenCalled();
	});

	it("returns valid when duration is under limit", async () => {
		vi.mocked(document.createElement).mockImplementation((tagName: string) => {
			if (tagName === "video") {
				return createMockVideo(30) as unknown as HTMLVideoElement;
			}
			return document.createElement(tagName);
		});

		const validator = maxDuration(60);
		const result = await validator(makeFileRef());

		expect(result).toEqual({ valid: true });
	});

	it("returns valid when duration equals limit", async () => {
		vi.mocked(document.createElement).mockImplementation((tagName: string) => {
			if (tagName === "video") {
				return createMockVideo(60) as unknown as HTMLVideoElement;
			}
			return document.createElement(tagName);
		});

		const validator = maxDuration(60);
		const result = await validator(makeFileRef());

		expect(result).toEqual({ valid: true });
	});

	it("returns invalid when duration exceeds limit", async () => {
		vi.mocked(document.createElement).mockImplementation((tagName: string) => {
			if (tagName === "video") {
				return createMockVideo(120) as unknown as HTMLVideoElement;
			}
			return document.createElement(tagName);
		});

		const validator = maxDuration(60);
		const result = await validator(makeFileRef());

		expect(result).toMatchObject({ valid: false });
		expect((result as { reason: string }).reason).toContain("exceeds maximum duration");
		expect((result as { reason: string }).reason).toContain("60s");
		expect((result as { reason: string }).reason).toContain("120");
	});

	it("returns valid on video load error", async () => {
		vi.mocked(document.createElement).mockImplementation((tagName: string) => {
			if (tagName === "video") {
				return createMockVideo(0, true) as unknown as HTMLVideoElement;
			}
			return document.createElement(tagName);
		});

		const validator = maxDuration(60);
		const result = await validator(makeFileRef());

		expect(result).toEqual({ valid: true });
	});

	it("revokes object URL after metadata load", async () => {
		const revokeSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
		vi.mocked(document.createElement).mockImplementation((tagName: string) => {
			if (tagName === "video") {
				return createMockVideo(30) as unknown as HTMLVideoElement;
			}
			return document.createElement(tagName);
		});

		const validator = maxDuration(60);
		await validator(makeFileRef());

		expect(revokeSpy).toHaveBeenCalled();
	});
});
