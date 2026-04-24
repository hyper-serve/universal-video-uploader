import { Text } from "react-native";
import { render, screen } from "@testing-library/react-native";
import { FileList } from "../FileList";
import type { FileState } from "@hyperserve/upload";

let mockFiles: FileState[] = [];

jest.mock("@hyperserve/upload", () => ({
	...jest.requireActual("@hyperserve/upload"),
	useUpload: () => ({
		files: mockFiles,
	}),
}));

jest.mock("../ViewModeContext", () => ({
	useViewMode: () => ({ viewMode: "list", setViewMode: jest.fn() }),
}));

function makeFile(id: string): FileState {
	return {
		id,
		ref: {
			platform: "native",
			name: `${id}.mp4`,
			size: 1000,
			type: "video/mp4",
			uri: `file:///${id}.mp4`,
		},
		status: "selected",
		progress: 0,
		thumbnailUri: null,
		playbackUrl: null,
		videoId: null,
		error: null,
		statusDetail: null,
	};
}

describe("FileList (native)", () => {
	beforeEach(() => {
		mockFiles = [];
	});

	it("renders emptyMessage as string when no files", () => {
		render(<FileList emptyMessage="No videos yet" />);
		expect(screen.getByText("No videos yet")).toBeTruthy();
	});

	it("renders emptyMessage as ReactNode when no files", () => {
		render(
			<FileList
				emptyMessage={<Text testID="custom-empty">Custom Empty</Text>}
			/>,
		);
		expect(screen.getByTestId("custom-empty")).toBeTruthy();
	});

	it("renders files using custom children render function", () => {
		mockFiles = [makeFile("a"), makeFile("b")];
		render(
			<FileList>
				{(file) => (
					<Text key={file.id} testID={`file-${file.id}`}>
						{file.ref.name}
					</Text>
				)}
			</FileList>,
		);
		expect(screen.getByTestId("file-a")).toBeTruthy();
		expect(screen.getByTestId("file-b")).toBeTruthy();
	});

	it("renders default items when no children prop", () => {
		mockFiles = [makeFile("x")];
		render(<FileList />);
		expect(screen.getByText("x.mp4")).toBeTruthy();
	});
});
