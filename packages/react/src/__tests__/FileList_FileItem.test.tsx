import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { FileState } from "@hyperserve/upload";
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

vi.mock("@hyperserve/upload", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@hyperserve/upload")>();
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

	it("FileItem children render-prop receives file state", () => {
		const file: FileState = {
			id: "1",
			ref: { name: "clip.mp4", size: 1024, type: "video/mp4", uri: "x" },
			status: "uploading",
			progress: 42,
			thumbnailUri: null,
			playbackUrl: null,
			videoId: null,
			error: null,
			statusDetail: null,
		};

		render(
			<FileItem file={file}>
				{(f) => <span data-testid="status">{f.status}:{f.progress}</span>}
			</FileItem>,
		);

		expect(screen.getByTestId("status").textContent).toBe("uploading:42");
	});

	it("StatusIcon renders spinner text for processing status", () => {
		const file: FileState = {
			id: "1",
			ref: { name: "clip.mp4", size: 1024, type: "video/mp4", uri: "x" },
			status: "processing",
			progress: 100,
			thumbnailUri: null,
			playbackUrl: null,
			videoId: "v1",
			error: null,
			statusDetail: null,
		};

		render(
			<FileItem file={file}>
				<FileItem.StatusIcon />
			</FileItem>,
		);

		expect(screen.getByText("Processing...")).toBeTruthy();
	});

	it("StatusIcon renders check icon for ready status", () => {
		const file: FileState = {
			id: "1",
			ref: { name: "clip.mp4", size: 1024, type: "video/mp4", uri: "x" },
			status: "ready",
			progress: 100,
			thumbnailUri: null,
			playbackUrl: "https://example.com",
			videoId: "v1",
			error: null,
			statusDetail: null,
		};

		const { container } = render(
			<FileItem file={file}>
				<FileItem.StatusIcon />
			</FileItem>,
		);

		expect(container.querySelector("svg")).toBeTruthy();
	});

	it("StatusIcon renders nothing for selected status", () => {
		const file: FileState = {
			id: "1",
			ref: { name: "clip.mp4", size: 1024, type: "video/mp4", uri: "x" },
			status: "selected",
			progress: 0,
			thumbnailUri: null,
			playbackUrl: null,
			videoId: null,
			error: null,
			statusDetail: null,
		};

		const { container } = render(
			<FileItem file={file}>
				<FileItem.StatusIcon />
			</FileItem>,
		);

		expect(container.querySelector("svg")).toBeNull();
		expect(container.textContent).toBe("");
	});

	it("UploadProgress only renders when status is uploading", () => {
		const uploading: FileState = {
			id: "1",
			ref: { name: "clip.mp4", size: 1024, type: "video/mp4", uri: "x" },
			status: "uploading",
			progress: 65,
			thumbnailUri: null,
			playbackUrl: null,
			videoId: null,
			error: null,
			statusDetail: null,
		};

		const { container, rerender } = render(
			<FileItem file={uploading}>
				<FileItem.UploadProgress />
			</FileItem>,
		);

		expect(container.querySelector("[role='progressbar']")).toBeTruthy();

		const selected: FileState = { ...uploading, status: "selected", progress: 0 };
		rerender(
			<FileItem file={selected}>
				<FileItem.UploadProgress />
			</FileItem>,
		);

		expect(container.querySelector("[role='progressbar']")).toBeNull();
	});

	it("RemoveButton shows Cancel label when file is uploading", () => {
		const file: FileState = {
			id: "1",
			ref: { name: "clip.mp4", size: 1024, type: "video/mp4", uri: "x" },
			status: "uploading",
			progress: 50,
			thumbnailUri: null,
			playbackUrl: null,
			videoId: null,
			error: null,
			statusDetail: null,
		};

		render(
			<FileItem file={file}>
				<FileItem.RemoveButton />
			</FileItem>,
		);

		expect(screen.getByLabelText("Cancel")).toBeTruthy();
	});

	it("RemoveButton shows Remove label for selected/failed files", () => {
		const file: FileState = {
			id: "1",
			ref: { name: "clip.mp4", size: 1024, type: "video/mp4", uri: "x" },
			status: "failed",
			progress: 0,
			thumbnailUri: null,
			playbackUrl: null,
			videoId: null,
			error: "Error",
			statusDetail: null,
		};

		render(
			<FileItem file={file}>
				<FileItem.RemoveButton />
			</FileItem>,
		);

		expect(screen.getByLabelText("Remove")).toBeTruthy();
	});

	it("throws when compound component is used outside FileItem", () => {
		expect(() => {
			render(<FileItem.FileName />);
		}).toThrow("FileItem compound components must be used within <FileItem>");
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

