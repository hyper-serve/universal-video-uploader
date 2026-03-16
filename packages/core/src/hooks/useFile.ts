import { useContext, useMemo } from "react";
import { UploadContext } from "../context.js";
import type { FileState } from "../types.js";

export function useFile(fileId: string): FileState | undefined {
	const context = useContext(UploadContext);
	if (!context) {
		throw new Error("useFile must be used within an UploadProvider");
	}
	return useMemo(
		() => context.files.find((f) => f.id === fileId),
		[context.files, fileId],
	);
}
