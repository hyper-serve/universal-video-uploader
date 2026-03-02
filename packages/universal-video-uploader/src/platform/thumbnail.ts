import type { FileRef } from "../types.js";

export async function createThumbnail(
	file: FileRef,
): Promise<string | null> {
	if (file.raw) {
		return URL.createObjectURL(file.raw);
	}
	return null;
}

export function revokeThumbnail(uri: string): void {
	URL.revokeObjectURL(uri);
}
