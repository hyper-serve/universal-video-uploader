import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	createThumbnail,
	revokeThumbnail,
} from "../platform/thumbnail.js";
import {
	revokeFileRef,
	toFileRef,
	toFileRefs,
} from "../platform/fileRef.js";
import type { FileRef } from "../types.js";

describe("thumbnail (web)", () => {
	beforeEach(() => {
		vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-thumb");
		vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("createThumbnail returns object URL when file.raw exists", async () => {
		const blob = new Blob(["x"], { type: "video/mp4" });
		const ref: FileRef = {
			name: "test.mp4",
			raw: new File([blob], "test.mp4", { type: "video/mp4" }),
			size: 1,
			type: "video/mp4",
			uri: "blob:test",
		};

		const result = await createThumbnail(ref);

		expect(result).toBe("blob:mock-thumb");
		expect(URL.createObjectURL).toHaveBeenCalledWith(ref.raw);
	});

	it("createThumbnail returns null when file.raw is missing", async () => {
		const ref: FileRef = {
			name: "test.mp4",
			size: 1024,
			type: "video/mp4",
			uri: "file:///tmp/test.mp4",
		};

		const result = await createThumbnail(ref);

		expect(result).toBeNull();
		expect(URL.createObjectURL).not.toHaveBeenCalled();
	});

	it("revokeThumbnail calls URL.revokeObjectURL", () => {
		revokeThumbnail("blob:thumb-123");

		expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:thumb-123");
	});
});

describe("fileRef (web)", () => {
	beforeEach(() => {
		vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-uri");
		vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("toFileRef converts File to FileRef", () => {
		const blob = new Blob(["content"], { type: "video/mp4" });
		const file = new File([blob], "video.mp4", { type: "video/mp4" });

		const ref = toFileRef(file);

		expect(ref).toEqual({
			name: "video.mp4",
			raw: file,
			size: file.size,
			type: "video/mp4",
			uri: "blob:mock-uri",
		});
		expect(URL.createObjectURL).toHaveBeenCalledWith(file);
	});

	it("toFileRefs converts File array to FileRef array", () => {
		const blob = new Blob(["a"], { type: "video/mp4" });
		const files = [
			new File([blob], "a.mp4", { type: "video/mp4" }),
			new File([blob], "b.mp4", { type: "video/mp4" }),
		];

		const refs = toFileRefs(files);

		expect(refs).toHaveLength(2);
		expect(refs[0].name).toBe("a.mp4");
		expect(refs[1].name).toBe("b.mp4");
	});

	it("revokeFileRef calls URL.revokeObjectURL with ref.uri", () => {
		const ref: FileRef = {
			name: "test.mp4",
			size: 1024,
			type: "video/mp4",
			uri: "blob:abc-123",
		};

		revokeFileRef(ref);

		expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:abc-123");
	});
});
