import {
	render,
	screen,
	fireEvent,
	waitFor,
} from "@testing-library/react-native";
import { FilePicker } from "../FilePicker";
import type { FileRef } from "@hyperserve/upload";

const mockAddFiles = jest.fn();

jest.mock("@hyperserve/upload", () => ({
	...jest.requireActual("@hyperserve/upload"),
	useUpload: () => ({
		addFiles: mockAddFiles,
	}),
}));

function makeRef(name = "video.mp4"): FileRef {
	return {
		platform: "native",
		name,
		size: 1024,
		type: "video/mp4",
		uri: `file:///${name}`,
	};
}

describe("FilePicker (native)", () => {
	beforeEach(() => {
		mockAddFiles.mockReset();
	});

	it("renders default button with Pick Videos text", () => {
		const pickFiles = jest.fn().mockResolvedValue([]);
		render(<FilePicker pickFiles={pickFiles} />);
		expect(screen.getByText("Pick Videos")).toBeTruthy();
	});

	it("calls pickFiles and addFiles when pressed", async () => {
		const refs = [makeRef("a.mp4"), makeRef("b.mp4")];
		const pickFiles = jest.fn().mockResolvedValue(refs);

		render(<FilePicker pickFiles={pickFiles} />);
		fireEvent.press(screen.getByText("Pick Videos"));

		await waitFor(() => {
			expect(mockAddFiles).toHaveBeenCalledWith(refs);
		});
	});

	it("does not call addFiles when pickFiles returns empty array", async () => {
		const pickFiles = jest.fn().mockResolvedValue([]);

		render(<FilePicker pickFiles={pickFiles} />);
		fireEvent.press(screen.getByText("Pick Videos"));

		await waitFor(() => {
			expect(pickFiles).toHaveBeenCalled();
		});
		expect(mockAddFiles).not.toHaveBeenCalled();
	});

	it("renders custom children", () => {
		const pickFiles = jest.fn().mockResolvedValue([]);
		render(
			<FilePicker pickFiles={pickFiles}>
				<></>
			</FilePicker>,
		);
		expect(screen.queryByText("Pick Videos")).toBeNull();
	});

	it("supports children render-prop with pick function", async () => {
		const refs = [makeRef()];
		const pickFiles = jest.fn().mockResolvedValue(refs);
		const TestButton = () => {
			return (
				<FilePicker pickFiles={pickFiles}>
					{({ pick }) => {
						// eslint-disable-next-line @typescript-eslint/no-var-requires
						const { Pressable, Text } = require("react-native");
						return (
							<Pressable onPress={pick} testID="pick-btn">
								<Text>Custom Pick</Text>
							</Pressable>
						);
					}}
				</FilePicker>
			);
		};

		render(<TestButton />);
		fireEvent.press(screen.getByTestId("pick-btn"));

		await waitFor(() => {
			expect(mockAddFiles).toHaveBeenCalledWith(refs);
		});
	});
});
