import {
	type FileState,
	UploadContext,
	type UploadContextValue,
	ViewModeProvider,
} from "@hyperserve/video-uploader";
import type React from "react";
import { useMemo } from "react";

type MockFilesProviderProps = {
	files: FileState[];
	defaultMode?: "list" | "grid";
	children: React.ReactNode;
};

export function MockFilesProvider({
	files,
	defaultMode = "list",
	children,
}: MockFilesProviderProps) {
	const value: UploadContextValue = useMemo(
		() => ({
			addFiles: () => {},
			allReady: files.length > 0 && files.every((f) => f.status === "ready"),
			allSettled:
				files.length > 0 &&
				files.every((f) => f.status === "ready" || f.status === "failed"),
			canAddMore: true,
			failedCount: files.filter((f) => f.status === "failed").length,
			files,
			hasErrors: files.some((f) => f.status === "failed"),
			isUploading: files.some((f) => f.status === "uploading"),
			readyCount: files.filter((f) => f.status === "ready").length,
			removeFile: () => {},
			retryFile: () => {},
			updateFileStatus: () => {},
		}),
		[files],
	);

	return (
		<UploadContext.Provider value={value}>
			<ViewModeProvider defaultMode={defaultMode}>{children}</ViewModeProvider>
		</UploadContext.Provider>
	);
}
