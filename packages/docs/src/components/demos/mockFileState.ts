import type { FileState } from "@hyperserve/upload";

export const mockRef = {
	platform: "web" as const,
	name: "sample-video.mp4",
	size: 52428800,
	type: "video/mp4",
	uri: "",
	raw: null as unknown as File,
};

const base: FileState = {
	id: "mock",
	ref: mockRef,
	status: "selected",
	progress: 0,
	thumbnailUri: null,
	playbackUrl: null,
	videoId: null,
	error: null,
	statusDetail: null,
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
	status: "uploading",
	progress: 55,
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
	status: "ready",
	playbackUrl: "https://example.com/video.mp4",
};

export const failedFile: FileState = {
	...base,
	id: "mock-failed",
	status: "failed",
	error: "Upload failed. Check your connection.",
};
