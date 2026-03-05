import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { DropZone } from "../DropZone.js";

const addFilesMock = vi.fn();
let canAddMoreValue = true;

vi.mock("@hyperserve/universal-video-uploader", () => {
	return {
		useUpload: () => ({
			addFiles: addFilesMock,
			canAddMore: canAddMoreValue,
		}),
		toFileRefs: (files: File[] | FileList) => Array.from(files),
	};
});

function createFile(name: string, type: string): File {
	return new File(["content"], name, { type });
}

describe("DropZone", () => {
	beforeEach(() => {
		addFilesMock.mockReset();
		canAddMoreValue = true;
		vi.restoreAllMocks();
	});

	it("calls input click on Enter and Space when enabled", () => {
		const clickSpy = vi
			.spyOn(HTMLInputElement.prototype, "click")
			.mockImplementation(() => {});

		const { getByRole } = render(<DropZone />);
		const button = getByRole("button");

		fireEvent.keyDown(button, { key: "Enter" });
		fireEvent.keyDown(button, { key: " " });

		expect(clickSpy).toHaveBeenCalledTimes(2);
	});

	it("does not open picker when disabled", () => {
		const clickSpy = vi
			.spyOn(HTMLInputElement.prototype, "click")
			.mockImplementation(() => {});

		const { getByRole } = render(<DropZone disabled />);
		const button = getByRole("button");

		fireEvent.keyDown(button, { key: "Enter" });
		fireEvent.keyDown(button, { key: " " });
		fireEvent.click(button);

		expect(clickSpy).not.toHaveBeenCalled();
	});

	it("filters dropped files using accept and passes only matching files to addFiles", () => {
		const { getByRole } = render(<DropZone accept="video/*" />);
		const zone = getByRole("button");

		const videoFile = createFile("video.mp4", "video/mp4");
		const textFile = createFile("notes.txt", "text/plain");

		fireEvent.drop(zone, {
			dataTransfer: {
				files: [videoFile, textFile],
			},
		});

		expect(addFilesMock).toHaveBeenCalledTimes(1);
		const passed = addFilesMock.mock.calls[0][0] as File[];
		expect(passed).toHaveLength(1);
		expect(passed[0].name).toBe("video.mp4");
	});

	it("does nothing on drop when disabled via canAddMore === false", () => {
		addFilesMock.mockImplementation(() => {});
		canAddMoreValue = false;

		const { getByRole } = render(<DropZone />);
		const zone = getByRole("button");

		const videoFile = createFile("video.mp4", "video/mp4");

		fireEvent.drop(zone, {
			dataTransfer: {
				files: [videoFile],
			},
		});

		expect(addFilesMock).not.toHaveBeenCalled();
		expect(zone.getAttribute("aria-disabled")).toBe("true");
		expect(zone.getAttribute("tabindex")).toBe("-1");
	});
});

