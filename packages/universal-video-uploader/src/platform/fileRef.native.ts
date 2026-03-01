import type { FileRef } from "../types.js";

export type DocumentPickerResult = {
	name: string;
	size: number;
	type: string;
	uri: string;
};

export function toFileRef(result: DocumentPickerResult): FileRef {
	return {
		name: result.name,
		size: result.size,
		type: result.type,
		uri: result.uri,
	};
}

export function toFileRefs(results: DocumentPickerResult[]): FileRef[] {
	return results.map(toFileRef);
}

export function revokeFileRef(_ref: FileRef): void {}
