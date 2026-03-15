import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { FileItem } from "../FileItem";
import type { FileState } from "@hyperserve/universal-video-uploader";

const mockRemoveFile = jest.fn();
const mockRetryFile = jest.fn();

jest.mock("@hyperserve/universal-video-uploader", () => ({
	...jest.requireActual("@hyperserve/universal-video-uploader"),
	useUpload: () => ({
		removeFile: mockRemoveFile,
		retryFile: mockRetryFile,
	}),
}));

function makeFile(overrides: Partial<FileState> = {}): FileState {
	return {
		id: "1",
		ref: { name: "clip.mp4", size: 1024 * 1024, type: "video/mp4", uri: "file:///clip.mp4" },
		status: "selected",
		progress: 0,
		thumbnailUri: null,
		playbackUrl: null,
		videoId: null,
		error: null,
		statusDetail: null,
		...overrides,
	};
}

describe("FileItem (native)", () => {
	beforeEach(() => {
		mockRemoveFile.mockReset();
		mockRetryFile.mockReset();
	});

	it("renders FileName with the file name", () => {
		render(
			<FileItem file={makeFile()}>
				<FileItem.FileName />
			</FileItem>,
		);
		expect(screen.getByText("clip.mp4")).toBeTruthy();
	});

	it("renders FileSize formatted as MB", () => {
		render(
			<FileItem file={makeFile()}>
				<FileItem.FileSize />
			</FileItem>,
		);
		expect(screen.getByText("1.0 MB")).toBeTruthy();
	});

	it("renders FileSize as KB for small files", () => {
		render(
			<FileItem file={makeFile({ ref: { name: "s.mp4", size: 512, type: "video/mp4", uri: "x" } })}>
				<FileItem.FileSize />
			</FileItem>,
		);
		expect(screen.getByText("1 KB")).toBeTruthy();
	});

	it("renders ErrorMessage only when error exists", () => {
		const { rerender } = render(
			<FileItem file={makeFile()}>
				<FileItem.ErrorMessage />
			</FileItem>,
		);
		expect(screen.queryByText("Upload failed")).toBeNull();

		rerender(
			<FileItem file={makeFile({ error: "Upload failed", status: "failed" })}>
				<FileItem.ErrorMessage />
			</FileItem>,
		);
		expect(screen.getByText("Upload failed")).toBeTruthy();
	});

	it("RemoveButton calls removeFile and is hidden for ready", () => {
		const { rerender } = render(
			<FileItem file={makeFile({ status: "failed", error: "err" })}>
				<FileItem.RemoveButton />
			</FileItem>,
		);

		fireEvent.press(screen.getByLabelText("Remove"));
		expect(mockRemoveFile).toHaveBeenCalledWith("1");

		rerender(
			<FileItem file={makeFile({ status: "ready", progress: 100, playbackUrl: "url", videoId: "v1" })}>
				<FileItem.RemoveButton />
			</FileItem>,
		);
		expect(screen.queryByLabelText("Remove")).toBeNull();
	});

	it("RemoveButton shows Cancel when file is uploading", () => {
		render(
			<FileItem file={makeFile({ status: "uploading", progress: 50 })}>
				<FileItem.RemoveButton />
			</FileItem>,
		);
		expect(screen.getByLabelText("Cancel")).toBeTruthy();
	});

	it("RetryButton only visible for failed files and calls retryFile", () => {
		const { rerender } = render(
			<FileItem file={makeFile({ status: "selected" })}>
				<FileItem.RetryButton />
			</FileItem>,
		);
		expect(screen.queryByLabelText("Retry")).toBeNull();

		rerender(
			<FileItem file={makeFile({ status: "failed", error: "err" })}>
				<FileItem.RetryButton />
			</FileItem>,
		);
		fireEvent.press(screen.getByLabelText("Retry"));
		expect(mockRetryFile).toHaveBeenCalledWith("1");
	});

	it("StatusIcon renders for processing and ready, nothing for selected", () => {
		const { rerender, toJSON } = render(
			<FileItem file={makeFile({ status: "selected" })}>
				<FileItem.StatusIcon />
			</FileItem>,
		);
		expect(screen.queryByText("✓")).toBeNull();

		rerender(
			<FileItem file={makeFile({ status: "ready", progress: 100, playbackUrl: "url", videoId: "v1" })}>
				<FileItem.StatusIcon />
			</FileItem>,
		);
		expect(screen.getByText("✓")).toBeTruthy();
	});

	it("UploadProgress renders only when uploading", () => {
		const { rerender } = render(
			<FileItem file={makeFile({ status: "uploading", progress: 50 })}>
				<FileItem.UploadProgress />
			</FileItem>,
		);
		expect(screen.getByRole("progressbar")).toBeTruthy();

		rerender(
			<FileItem file={makeFile({ status: "selected" })}>
				<FileItem.UploadProgress />
			</FileItem>,
		);
		expect(screen.queryByRole("progressbar")).toBeNull();
	});

	it("children render-prop receives file state", () => {
		const childFn = jest.fn(() => <></>);
		render(
			<FileItem file={makeFile({ status: "uploading", progress: 77 })}>
				{childFn}
			</FileItem>,
		);
		expect(childFn).toHaveBeenCalledWith(
			expect.objectContaining({ status: "uploading", progress: 77 }),
		);
	});

	it("throws when compound component is used outside FileItem", () => {
		expect(() => {
			render(<FileItem.FileName />);
		}).toThrow("FileItem compound components must be used within <FileItem>");
	});
});
