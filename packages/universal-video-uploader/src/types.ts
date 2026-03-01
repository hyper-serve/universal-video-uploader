export type FileRef = {
	uri: string;
	name: string;
	size: number;
	type: string;
	raw?: File;
};

export type FileStatus =
	| "selected"
	| "validating"
	| "uploading"
	| "processing"
	| "ready"
	| "failed";

export type FileState = {
	id: string;
	ref: FileRef;
	status: FileStatus;
	progress: number;
	thumbnailUri: string | null;
	playbackUrl: string | null;
	videoId: string | null;
	error: string | null;
};

export type ValidationResult =
	| { valid: true }
	| { valid: false; reason: string };

export type UploadOptions = {
	resolutions: string;
	isPublic: boolean;
	thumbnailTimestamps?: string;
	customUserMetadata?: Record<string, unknown>;
};

export type UploadConfig = {
	apiKey: string;
	baseUrl: string;
	adapter?: UploadAdapter;
	validate?: (file: FileRef) => ValidationResult | Promise<ValidationResult>;
	uploadOptions: UploadOptions;
	pollingIntervalMs?: number;
	maxConcurrentUploads?: number;
};

export type ViewMode = "list" | "grid";

export type UploadContextValue = {
	files: FileState[];
	addFiles: (files: FileRef[]) => void;
	removeFile: (id: string) => void;
	retryFile: (id: string) => void;
	clearCompleted: () => void;
	viewMode: ViewMode;
	setViewMode: (mode: ViewMode) => void;
};

export interface UploadAdapter {
	upload(
		file: FileRef,
		options: UploadOptions,
		config: { apiKey: string; baseUrl: string },
		callbacks: { onProgress: (pct: number) => void },
		signal: AbortSignal,
	): Promise<{ videoId: string; isPublic: boolean }>;
}
