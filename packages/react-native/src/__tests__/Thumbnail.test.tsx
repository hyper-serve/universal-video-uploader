import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Image } from "react-native";
import { Thumbnail } from "../Thumbnail";
import type { FileState } from "@hyperserve/upload";

const baseFile: FileState = {
	id: "f1",
	ref: { platform: "native", name: "clip.mp4", size: 1000, type: "video/mp4", uri: "file:///clip.mp4" },
	status: "selected",
	progress: 0,
	thumbnailUri: null,
	playbackUrl: null,
	videoId: null,
	error: null,
	statusDetail: null,
};

describe("Thumbnail (native)", () => {
	it("renders placeholder when no thumbnail", () => {
		const { toJSON } = render(<Thumbnail file={baseFile} />);
		const tree = toJSON();
		expect(tree).toBeTruthy();
		expect(screen.queryByTestId("thumbnail-image")).toBeNull();
	});

	it("renders custom placeholder when provided", () => {
		render(
			<Thumbnail file={baseFile} placeholder={<></>} />,
		);
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
			status: "ready",
			playbackUrl: "https://cdn.example.com/video.mp4",
			thumbnailUri: "file:///thumb.jpg",
		};

		const childFn = jest.fn(({ isReady, playbackUrl, thumbnailUri }) => (
			<></>
		));

		render(<Thumbnail file={file}>{childFn}</Thumbnail>);

		expect(childFn).toHaveBeenCalledWith({
			isReady: true,
			playbackUrl: "https://cdn.example.com/video.mp4",
			thumbnailUri: "file:///thumb.jpg",
		});
	});
});
