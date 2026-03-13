import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { FileState } from "@hyperserve/universal-video-uploader";
import { FileList } from "../FileList.js";
import { FileItem } from "../FileItem.js";

type MockUploadContext = {
	files: FileState[];
	removeFile: (id: string) => void;
	retryFile: (id: string) => void;
};

const removeFileMock = vi.fn();
const retryFileMock = vi.fn();

let mockContext: MockUploadContext = {
	files: [],
	removeFile: removeFileMock,
	retryFile: retryFileMock,
};

vi.mock("@hyperserve/universal-video-uploader", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@hyperserve/universal-video-uploader")>();
	return {
		...actual,
		useUpload: () => mockContext,
	};
});

describe("FileList and FileItem", () => {
	beforeEach(() => {
		removeFileMock.mockReset();
		retryFileMock.mockReset();
		mockContext = {
			files: [],
			removeFile: removeFileMock,
			retryFile: retryFileMock,
		};
	});

	it("renders emptyMessage when there are no files", () => {
		render(
			<FileList emptyMessage="Nothing here yet">
				{() => null}
			</FileList>,
		);

		expect(screen.getByText("Nothing here yet")).toBeTruthy();
	});

	it("prefers renderEmpty over emptyMessage", () => {
		render(
			<FileList
				emptyMessage="won't show"
				renderEmpty={() => <div>Custom empty</div>}
			>
				{() => null}
			</FileList>,
		);

		expect(screen.getByText("Custom empty")).toBeTruthy();
		expect(screen.queryByText("won't show")).toBeNull();
	});

	it("renders files in list mode by default", () => {
		const file: FileState = {
			id: "1",
			ref: { name: "video.mp4", size: 1234, type: "video/mp4", uri: "x" },
			status: "selected",
			progress: 0,
			thumbnailUri: null,
			playbackUrl: null,
			videoId: null,
			error: null,
			statusDetail: null,
		};
		mockContext.files = [file];

		const { container } = render(
			<FileList>{(f) => <div>{f.ref.name}</div>}</FileList>,
		);

		expect(screen.getByText("video.mp4")).toBeTruthy();
		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper.style.display).toBe("flex");
		expect(wrapper.style.flexDirection).toBe("column");
	});

	it("renders files in grid mode when viewMode is grid", () => {
		const file: FileState = {
			id: "1",
			ref: { name: "video.mp4", size: 1234, type: "video/mp4", uri: "x" },
			status: "selected",
			progress: 0,
			thumbnailUri: null,
			playbackUrl: null,
			videoId: null,
			error: null,
			statusDetail: null,
		};
		mockContext.files = [file];

		const { container } = render(
			<FileList mode="grid">{(f) => <div>{f.ref.name}</div>}</FileList>,
		);

		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper.style.display).toBe("grid");
		expect(wrapper.style.gridTemplateColumns).toContain("minmax");
	});

	it("FileItem compound components render name, size, error and buttons by status", () => {
		const base: FileState = {
			id: "1",
			ref: { name: "clip.mp4", size: 1024 * 1024, type: "video/mp4", uri: "x" },
			status: "failed",
			progress: 0,
			thumbnailUri: null,
			playbackUrl: null,
			videoId: null,
			error: "Oops",
			statusDetail: null,
		};

		render(
			<FileItem file={base}>
				<FileItem.FileName />
				<FileItem.FileSize />
				<FileItem.ErrorMessage />
				<FileItem.RetryButton />
				<FileItem.RemoveButton />
			</FileItem>,
		);

		expect(screen.getByText("clip.mp4")).toBeTruthy();
		expect(screen.getByText(/MB|KB/)).toBeTruthy();
		expect(screen.getByText("Oops")).toBeTruthy();

		fireEvent.click(screen.getByLabelText("Retry"));
		expect(retryFileMock).toHaveBeenCalledWith("1");

		fireEvent.click(screen.getByLabelText("Remove"));
		expect(removeFileMock).toHaveBeenCalledWith("1");
	});

it("hides RetryButton when status is not failed and hides RemoveButton for ready files", () => {
		const ready: FileState = {
			id: "2",
			ref: { name: "ready.mp4", size: 1000, type: "video/mp4", uri: "x" },
			status: "ready",
			progress: 100,
			thumbnailUri: null,
			playbackUrl: "https://example.com",
			videoId: "v2",
			error: null,
			statusDetail: null,
		};

		render(
			<FileItem file={ready}>
				<FileItem.FileName />
				<FileItem.RetryButton />
				<FileItem.RemoveButton />
			</FileItem>,
		);

		expect(screen.queryByText("Retry")).toBeNull();
		expect(screen.queryByLabelText("Remove")).toBeNull();
	});
});

