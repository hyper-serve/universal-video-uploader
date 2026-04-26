import type { FileState } from "@hyperserve/upload";

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
