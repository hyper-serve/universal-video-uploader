import { describe, expect, it } from "vitest";
import { maxDuration } from "../validation/maxDuration.native.js";
import type { FileRef } from "../types.js";

function makeFileRef(overrides: Partial<FileRef> = {}): FileRef {
	return {
		name: "test.mp4",
		size: 1024,
		type: "video/mp4",
		uri: "file:///tmp/test.mp4",
		...overrides,
	};
}

describe("maxDuration (native)", () => {
	it("returns valid when expo-video-metadata is not installed", async () => {
		const validator = maxDuration(60);
		const result = await validator(makeFileRef());

		expect(result).toEqual({ valid: true });
	});
});
