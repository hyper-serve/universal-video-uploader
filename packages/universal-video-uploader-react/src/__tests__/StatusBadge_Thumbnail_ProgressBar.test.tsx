import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../StatusBadge.js";
import { Thumbnail } from "../Thumbnail.js";
import { ProgressBar } from "../ProgressBar.js";
import type { FileState } from "@hyperserve/universal-video-uploader";

describe("StatusBadge", () => {
	it("uses default config for status and renders label", () => {
		render(<StatusBadge status="uploading" />);
		expect(screen.getByText("Uploading")).toBeTruthy();
	});

	it("allows overriding label and colors via statusConfig and getLabel", () => {
		render(
			<StatusBadge
				status="ready"
				getLabel={() => "Done"}
				statusConfig={{
					ready: { bg: "#000000", text: "#ffffff", label: "ignored" },
				}}
			/>,
		);

		const badge = screen.getByText("Done");
		expect(badge).toBeTruthy();
		expect((badge as HTMLElement).style.backgroundColor).toBe("rgb(0, 0, 0)");
	});

	it("supports render-prop children", () => {
		render(
			<StatusBadge status="failed">
				{({ label, color }) => (
					<span data-testid="custom" style={{ color }}>
						{label}
					</span>
				)}
			</StatusBadge>,
		);

		const el = screen.getByTestId("custom");
		expect(el.textContent).toMatch(/Failed/i);
	});
});

describe("Thumbnail", () => {
	const baseFile: FileState = {
		id: "f1",
		ref: { name: "clip.mp4", size: 1000, type: "video/mp4", uri: "x" },
		status: "selected",
		progress: 0,
		thumbnailUri: null,
		playbackUrl: null,
		videoId: null,
		error: null,
		statusDetail: null,
	};

	it("renders placeholder when no thumbnail or playbackUrl", () => {
		const { container } = render(<Thumbnail file={baseFile} />);
		const placeholder = container.querySelector('svg');
		expect(placeholder).toBeTruthy();
	});

	it("renders custom placeholder when placeholder prop is provided", () => {
		render(
			<Thumbnail file={baseFile} placeholder={<span data-testid="custom-placeholder">No preview</span>} />,
		);
		expect(screen.getByTestId("custom-placeholder").textContent).toBe("No preview");
		const { container } = render(<Thumbnail file={baseFile} placeholder={<span>Custom</span>} />);
		expect(container.querySelector("svg")).toBeNull();
	});

	it("renders thumbnail image when thumbnailUri is present", () => {
		const file = { ...baseFile, thumbnailUri: "blob:thumb" };
		const { container } = render(<Thumbnail file={file} />);
		const img = container.querySelector("img");
		expect(img).not.toBeNull();
		expect(img?.getAttribute("src")).toBe("blob:thumb");
	});

	it("renders playback video when playback is true and file is ready", () => {
		const file: FileState = {
			...baseFile,
			status: "ready",
			playbackUrl: "https://cdn.example.com/video.mp4",
		};
		const { container } = render(<Thumbnail file={file} playback />);
		const video = container.querySelector("video");
		expect(video).not.toBeNull();
	});

	it("supports render-prop children", () => {
		const file: FileState = {
			...baseFile,
			status: "ready",
			playbackUrl: "https://cdn.example.com/video.mp4",
			thumbnailUri: "blob:thumb",
		};

		render(
			<Thumbnail file={file}>
				{({ isReady, playbackUrl, thumbnailUri }) => (
					<div data-testid="info">
						{isReady ? "ready" : "not-ready"}|{playbackUrl}|{thumbnailUri}
					</div>
				)}
			</Thumbnail>,
		);

		const info = screen.getByTestId("info");
		expect(info.textContent).toContain("ready");
		expect(info.textContent).toContain("video.mp4");
		expect(info.textContent).toContain("blob:thumb");
	});
});

describe("ProgressBar", () => {
	it("renders progress with correct aria attributes and width", () => {
		const { getByRole } = render(<ProgressBar progress={42} />);
		const bar = getByRole("progressbar");
		expect(bar.getAttribute("aria-valuenow")).toBe("42");
		const inner = (bar as HTMLElement).firstElementChild as HTMLElement;
		expect(inner.style.width).toBe("42%");
	});

	it("supports render-prop children", () => {
		render(
			<ProgressBar progress={75}>
				{(p) => <span data-testid="label">{p}%</span>}
			</ProgressBar>,
		);
		expect(screen.getByTestId("label").textContent).toBe("75%");
	});
});

