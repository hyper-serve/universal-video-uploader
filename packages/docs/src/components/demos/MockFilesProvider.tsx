import {
	UploadContext,
	ViewModeProvider,
	type FileState,
	type UploadContextValue,
} from "@hyperserve/upload";
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
			files,
			addFiles: () => {},
			removeFile: () => {},
			retryFile: () => {},
			updateFileStatus: () => {},
			canAddMore: true,
			isUploading: files.some((f) => f.status === "uploading"),
			hasErrors: files.some((f) => f.status === "failed"),
			allReady: files.length > 0 && files.every((f) => f.status === "ready"),
			allSettled:
				files.length > 0 &&
				files.every((f) => f.status === "ready" || f.status === "failed"),
			readyCount: files.filter((f) => f.status === "ready").length,
			failedCount: files.filter((f) => f.status === "failed").length,
		}),
		[files],
	);

	return (
		<UploadContext.Provider value={value}>
			<ViewModeProvider defaultMode={defaultMode}>{children}</ViewModeProvider>
		</UploadContext.Provider>
	);
}
