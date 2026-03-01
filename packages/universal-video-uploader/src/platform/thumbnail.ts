import type { FileRef } from "../types.js";

export function createThumbnail(file: FileRef): string | null {
	if (file.raw) {
		return URL.createObjectURL(file.raw);
	}
	return null;
}

export function revokeThumbnail(uri: string): void {
	URL.revokeObjectURL(uri);
}
