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

	it("renders correct labels for all 6 statuses", () => {
		const statuses: Array<{ status: import("@hyperserve/universal-video-uploader").FileStatus; label: string }> = [
			{ status: "selected", label: "Selected" },
			{ status: "validating", label: "Validating" },
			{ status: "uploading", label: "Uploading" },
			{ status: "processing", label: "Processing" },
			{ status: "ready", label: "Ready" },
			{ status: "failed", label: "Failed" },
		];

		for (const { status, label } of statuses) {
			const { unmount } = render(<StatusBadge status={status} />);
			expect(screen.getByText(label)).toBeTruthy();
			unmount();
		}
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

	it("falls back to placeholder when thumbnail image fails to load", () => {
		const file = { ...baseFile, thumbnailUri: "blob:broken" };
		const { container } = render(<Thumbnail file={file} />);

		const img = container.querySelector("img");
		expect(img).not.toBeNull();

		const { fireEvent } = require("@testing-library/react");
		fireEvent.error(img!);

		expect(container.querySelector("img")).toBeNull();
		expect(container.querySelector("svg")).toBeTruthy();
	});

	it("does not render video when playback is true but file is not ready", () => {
		const file: FileState = {
			...baseFile,
			status: "uploading",
			playbackUrl: null,
		};
		const { container } = render(<Thumbnail file={file} playback />);
		expect(container.querySelector("video")).toBeNull();
	});

	it("renders video with controls prop", () => {
		const file: FileState = {
			...baseFile,
			status: "ready",
			playbackUrl: "https://cdn.example.com/video.mp4",
		};

		const { container: c1 } = render(<Thumbnail file={file} playback controls={false} />);
		const video1 = c1.querySelector("video");
		expect(video1).not.toBeNull();
		expect(video1?.hasAttribute("controls")).toBe(false);

		const { container: c2 } = render(<Thumbnail file={file} playback controls />);
		const video2 = c2.querySelector("video");
		expect(video2).not.toBeNull();
		expect(video2?.hasAttribute("controls")).toBe(true);
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

	it("renders correctly at 0%", () => {
		const { getByRole } = render(<ProgressBar progress={0} />);
		const bar = getByRole("progressbar");
		expect(bar.getAttribute("aria-valuenow")).toBe("0");
		expect(bar.getAttribute("aria-valuemin")).toBe("0");
		expect(bar.getAttribute("aria-valuemax")).toBe("100");
		const inner = (bar as HTMLElement).firstElementChild as HTMLElement;
		expect(inner.style.width).toBe("0%");
	});

	it("renders correctly at 100%", () => {
		const { getByRole } = render(<ProgressBar progress={100} />);
		const bar = getByRole("progressbar");
		expect(bar.getAttribute("aria-valuenow")).toBe("100");
		const inner = (bar as HTMLElement).firstElementChild as HTMLElement;
		expect(inner.style.width).toBe("100%");
	});
});

