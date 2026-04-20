export type BackgroundUploadModule = {
	startUpload: (options: Record<string, unknown>) => Promise<string>;
	addListener: (
		event: string,
		uploadId: string,
		callback: (data: Record<string, unknown>) => void,
	) => { remove: () => void };
	cancelUpload: (uploadId: string) => void;
};

let resolved: BackgroundUploadModule | null = null;
let didResolve = false;
let didWarn = false;

export function getBackgroundUpload(): BackgroundUploadModule | null {
	if (didResolve) return resolved;
	didResolve = true;
	try {
		resolved = require("react-native-background-upload");
	} catch {
		if (!didWarn) {
			didWarn = true;
			console.warn(
				"react-native-background-upload is not installed. Falling back to fetch-based upload with coarse progress reporting.",
			);
		}
	}
	return resolved;
}
