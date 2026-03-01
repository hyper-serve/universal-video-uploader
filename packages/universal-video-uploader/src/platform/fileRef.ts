import type { FileRef } from "../types.js";

export function toFileRef(file: File): FileRef {
	return {
		name: file.name,
		raw: file,
		size: file.size,
		type: file.type,
		uri: URL.createObjectURL(file),
	};
}

export function toFileRefs(files: FileList | File[]): FileRef[] {
	return Array.from(files).map(toFileRef);
}

export function revokeFileRef(ref: FileRef): void {
	URL.revokeObjectURL(ref.uri);
}
