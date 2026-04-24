import { act, renderHook } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { UploadProvider } from "../context.js";
import { useFile } from "../hooks/useFile.js";
import { useUpload } from "../hooks/useUpload.js";
import type { FileRef, UploadConfig } from "../types.js";

vi.mock("../platform/thumbnail.js", () => ({
	createThumbnail: vi.fn().mockResolvedValue(null),
	revokeThumbnail: vi.fn(),
}));

function makeConfig(): UploadConfig {
	return {
		adapter: {
			upload: vi.fn(() => new Promise(() => {})),
		},
		uploadOptions: { isPublic: true, resolutions: "480p" },
	};
}

describe("useFile", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("throws when used outside UploadProvider", () => {
		expect(() => {
			renderHook(() => useFile("some-id"));
		}).toThrow("useFile must be used within an UploadProvider");
	});

	it("returns undefined for a non-existent fileId", () => {
		const config = makeConfig();
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<UploadProvider config={config}>{children}</UploadProvider>
		);
		const { result } = renderHook(() => useFile("non-existent"), { wrapper });
		expect(result.current).toBeUndefined();
	});

	it("returns the matching FileState by id", async () => {
		const config = makeConfig();
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<UploadProvider config={config}>{children}</UploadProvider>
		);

		const { result, rerender } = renderHook(
			({ fileId }: { fileId: string }) => ({
				upload: useUpload(),
				file: useFile(fileId),
			}),
			{ wrapper, initialProps: { fileId: "" } },
		);

		const ref: FileRef = {
			platform: "native",
			name: "test.mp4",
			size: 1024,
			type: "video/mp4",
			uri: "blob:test",
		};

		act(() => {
			result.current.upload.addFiles([ref]);
		});

		await act(async () => {
			await vi.advanceTimersByTimeAsync(0);
		});

		expect(result.current.upload.files).toHaveLength(1);
		const addedId = result.current.upload.files[0].id;

		rerender({ fileId: addedId });

		expect(result.current.file).toBeDefined();
		expect(result.current.file?.ref.name).toBe("test.mp4");
		expect(result.current.file?.id).toBe(addedId);
	});
});
