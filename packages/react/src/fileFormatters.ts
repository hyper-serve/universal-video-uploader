import type { FileState } from "@hyperserve/upload";

export function formatFileSize(bytes: number): string {
	const mb = bytes / (1024 * 1024);
	return mb < 1
		? `${(bytes / 1024).toFixed(0)} KB`
		: `${mb.toFixed(1)} MB`;
}

export function getFileDisplayName(file: FileState): string {
	return file.ref.name;
}
