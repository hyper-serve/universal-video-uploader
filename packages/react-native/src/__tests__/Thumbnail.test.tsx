import type { FileState } from "@hyperserve/upload";
import { render, screen } from "@testing-library/react-native";
import { Image } from "react-native";
import { Thumbnail } from "../Thumbnail.js";

const baseFile: FileState = {
	error: null,
	id: "f1",
	playbackUrl: null,
	progress: 0,
	ref: {
		name: "clip.mp4",
		platform: "native",
		size: 1000,
		type: "video/mp4",
		uri: "file:///clip.mp4",
	},
	status: "selected",
	statusDetail: null,
	thumbnailUri: null,
	videoId: null,
};

describe("Thumbnail (native)", () => {
	it("renders placeholder when no thumbnail", () => {
		const { toJSON } = render(<Thumbnail file={baseFile} />);
		const tree = toJSON();
		expect(tree).toBeTruthy();
		expect(screen.queryByTestId("thumbnail-image")).toBeNull();
	});

	it("renders custom placeholder when provided", () => {
		// biome-ignore lint/complexity/noUselessFragments: empty fragment is intentional placeholder test
		render(<Thumbnail file={baseFile} placeholder={<></>} />);
		const tree = render(<Thumbnail file={baseFile} />);
		expect(tree.toJSON()).toBeTruthy();
	});

	it("renders Image when thumbnailUri is present", () => {
		const file = { ...baseFile, thumbnailUri: "file:///thumb.jpg" };
		const { UNSAFE_getByType } = render(<Thumbnail file={file} />);
		const img = UNSAFE_getByType(Image);
		expect(img.props.source).toEqual({ uri: "file:///thumb.jpg" });
	});

	it("supports children render-prop", () => {
		const file: FileState = {
			...baseFile,
			playbackUrl: "https://cdn.example.com/video.mp4",
			status: "ready",
			thumbnailUri: "file:///thumb.jpg",
		};

		// biome-ignore lint/correctness/noUnusedFunctionParameters: destructured to verify shape, values unused
		const childFn = jest.fn(({ isReady, playbackUrl, thumbnailUri }) => <></>);

		render(<Thumbnail file={file}>{childFn}</Thumbnail>);

		expect(childFn).toHaveBeenCalledWith({
			isReady: true,
			playbackUrl: "https://cdn.example.com/video.mp4",
			thumbnailUri: "file:///thumb.jpg",
		});
	});
});
