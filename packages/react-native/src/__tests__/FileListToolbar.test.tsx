import React from "react";
import { Text } from "react-native";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { FileListToolbar } from "../FileListToolbar";
import type { FileState } from "@hyper-serve/upload";

let mockFiles: FileState[] = [];
let mockViewMode = "list";
const mockSetViewMode = jest.fn((mode: string) => {
	mockViewMode = mode;
});

jest.mock("@hyper-serve/upload", () => ({
	...jest.requireActual("@hyper-serve/upload"),
	useUpload: () => ({
		files: mockFiles,
	}),
}));

jest.mock("../ViewModeContext", () => ({
	useViewMode: () => ({
		viewMode: mockViewMode,
		setViewMode: mockSetViewMode,
	}),
}));

function makeFile(id: string): FileState {
	return {
		id,
		ref: { platform: "native", name: `${id}.mp4`, size: 1000, type: "video/mp4", uri: "x" },
		status: "selected",
		progress: 0,
		thumbnailUri: null,
		playbackUrl: null,
		videoId: null,
		error: null,
		statusDetail: null,
	};
}

describe("FileListToolbar (native)", () => {
	beforeEach(() => {
		mockFiles = [];
		mockViewMode = "list";
		mockSetViewMode.mockClear();
	});

	it("renders file count with correct pluralization", () => {
		mockFiles = [makeFile("1")];
		const { rerender } = render(<FileListToolbar />);
		expect(screen.getByText("1 file added")).toBeTruthy();

		mockFiles = [makeFile("1"), makeFile("2")];
		rerender(<FileListToolbar />);
		expect(screen.getByText("2 files added")).toBeTruthy();
	});

	it("renders 0 files added when empty", () => {
		render(<FileListToolbar />);
		expect(screen.getByText("0 files added")).toBeTruthy();
	});

	it("uses custom label for FileCount", () => {
		mockFiles = [makeFile("1"), makeFile("2")];
		render(
			<FileListToolbar
				left={<FileListToolbar.FileCount label={(n) => `${n} videos`} />}
			/>,
		);
		expect(screen.getByText("2 videos")).toBeTruthy();
	});

	it("renders List and Grid toggle buttons", () => {
		render(<FileListToolbar />);
		expect(screen.getByText("List")).toBeTruthy();
		expect(screen.getByText("Grid")).toBeTruthy();
	});

	it("ViewToggle calls setViewMode on press", () => {
		render(<FileListToolbar />);
		fireEvent.press(screen.getByText("Grid"));
		expect(mockSetViewMode).toHaveBeenCalledWith("grid");

		fireEvent.press(screen.getByText("List"));
		expect(mockSetViewMode).toHaveBeenCalledWith("list");
	});

	it("hides file count when showFileCount is false", () => {
		mockFiles = [makeFile("1")];
		render(<FileListToolbar showFileCount={false} />);
		expect(screen.queryByText("1 file added")).toBeNull();
	});

	it("hides view toggle when showViewToggle is false", () => {
		render(<FileListToolbar showViewToggle={false} />);
		expect(screen.queryByText("List")).toBeNull();
		expect(screen.queryByText("Grid")).toBeNull();
	});

	it("uses custom left and right slots", () => {
		render(
			<FileListToolbar
				left={<Text>Custom Left</Text>}
				right={<Text>Custom Right</Text>}
			/>,
		);
		expect(screen.getByText("Custom Left")).toBeTruthy();
		expect(screen.getByText("Custom Right")).toBeTruthy();
	});

	it("ViewToggle supports children render-prop", () => {
		render(
			<FileListToolbar
				right={
					<FileListToolbar.ViewToggle>
						{({ viewMode }) => <Text testID="mode">{viewMode}</Text>}
					</FileListToolbar.ViewToggle>
				}
			/>,
		);
		expect(screen.getByTestId("mode").props.children).toBe("list");
	});
});
