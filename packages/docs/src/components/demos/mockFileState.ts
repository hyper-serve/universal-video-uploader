import type { FileState } from "@hyperserve/upload";

export const THUMB_SVG =
	"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='90'%3E%3Crect width='160' height='90' fill='%23cbd5e1'/%3E%3Ctext x='80' y='48' text-anchor='middle' dominant-baseline='middle' fill='%2394a3b8' font-size='11' font-family='sans-serif'%3Evideo.mp4%3C/text%3E%3C/svg%3E";

export const VIDEO_URL =
	"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

export const mockRef = {
	name: "sample-video.mp4",
	platform: "web" as const,
	raw: null as unknown as File,
	size: 52428800,
	type: "video/mp4",
	uri: "",
};

const base: FileState = {
	error: null,
	id: "mock",
	playbackUrl: null,
	progress: 0,
	ref: mockRef,
	status: "selected",
	statusDetail: null,
	thumbnailUri: null,
	videoId: null,
};

export function mockFile(overrides: Partial<FileState> = {}): FileState {
	return { ...base, ...overrides };
}

export const selectedFile: FileState = {
	...base,
	id: "mock-selected",
	status: "selected",
};

export const uploadingFile: FileState = {
	...base,
	id: "mock-uploading",
	progress: 55,
	status: "uploading",
};

export const processingFile: FileState = {
	...base,
	id: "mock-processing",
	status: "processing",
	statusDetail: "Transcoding 60%",
};

export const readyFile: FileState = {
	...base,
	id: "mock-ready",
	playbackUrl: "https://example.com/video.mp4",
	status: "ready",
};

export const failedFile: FileState = {
	...base,
	error: "Upload failed. Check your connection.",
	id: "mock-failed",
	status: "failed",
};
