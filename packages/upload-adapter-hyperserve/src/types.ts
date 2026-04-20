import type { FileRef, ProcessingStatus } from "@hyperserve/upload";

export type HyperserveUploadOptions = {
	resolutions: string[];
	isPublic: boolean;
	thumbnail?: { timestampMs: number };
	metadata?: Record<string, unknown>;
};

export type HyperserveAdapterConfig = {
	createUpload: (
		file: FileRef,
		options: HyperserveUploadOptions,
	) => Promise<{ videoId: string; uploadUrl: string; contentType: string }>;
	completeUpload: (videoId: string) => Promise<void>;
};

export type VideoStatusResult = {
	status: ProcessingStatus;
	playbackUrl?: string;
	statusDetail?: string;
};
