import { useContext } from "react";
import { UploadContext } from "../context.js";
import type { UploadContextValue } from "../types.js";

export function useUpload(): UploadContextValue {
	const context = useContext(UploadContext);
	if (!context) {
		throw new Error("useUpload must be used within an UploadProvider");
	}
	return context;
}
