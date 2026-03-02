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
	statusDetail: string | null;
};

export type ValidationResult =
	| { valid: true }
	| { valid: false; reason: string };

export type HyperserveUploadOptions = {
	resolutions: string;
	isPublic: boolean;
	thumbnailTimestamps?: string;
	customUserMetadata?: Record<string, unknown>;
};

export type UploadResult = {
	videoId: string;
	playbackUrl?: string;
	metadata?: Record<string, unknown>;
};

export type UploadConfig<
	TOptions = Record<string, unknown>,
> = {
	adapter: UploadAdapter<TOptions>;
	statusChecker?: StatusChecker;
	validate?: (file: FileRef) => ValidationResult | Promise<ValidationResult>;
	uploadOptions: TOptions;
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

export interface UploadAdapter<TOptions = Record<string, unknown>> {
	upload(
		file: FileRef,
		options: TOptions,
		callbacks: { onProgress: (pct: number) => void },
		signal: AbortSignal,
	): Promise<UploadResult>;
}

export interface StatusChecker {
	checkStatus(options: {
		uploadResult: UploadResult;
		onStatusChange: (
			status: "processing" | "ready" | "failed",
			playbackUrl?: string,
			statusDetail?: string,
		) => void;
		signal: AbortSignal;
	}): void;
}
