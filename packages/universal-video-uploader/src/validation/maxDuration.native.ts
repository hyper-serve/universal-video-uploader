import type { FileRef, ValidationResult } from "../types.js";

let warned = false;

/**
 * Duration validation is not available on React Native.
 * On web, this uses the DOM video element to check duration.
 * On RN, use server-side validation or a native module like expo-av.
 */
export function maxDuration(
	_seconds: number,
): (file: FileRef) => ValidationResult | Promise<ValidationResult> {
	if (!warned) {
		warned = true;
		console.warn(
			"maxDuration validator is not supported on React Native. " +
				"Consider validating duration server-side.",
		);
	}
	return () => ({ valid: true });
}
