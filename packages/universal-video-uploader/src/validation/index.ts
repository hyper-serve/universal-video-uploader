import type { FileRef, ValidationResult } from "../types.js";

export type Validator = (
	file: FileRef,
) => ValidationResult | Promise<ValidationResult>;

export function maxFileSize(bytes: number): Validator {
	return (file) => {
		if (file.size > bytes) {
			const sizeMB = (bytes / (1024 * 1024)).toFixed(0);
			return {
				reason: `File exceeds maximum size of ${sizeMB}MB`,
				valid: false,
			};
		}
		return { valid: true };
	};
}

export function allowedTypes(types: string[]): Validator {
	return (file) => {
		const matches = types.some((t) => {
			if (t.includes("*")) {
				const pattern = t.replace("*", ".*");
				return new RegExp(`^${pattern}$`).test(file.type);
			}
			return file.type === t;
		});

		if (!matches) {
			return {
				reason: `File type "${file.type}" is not allowed. Allowed: ${types.join(", ")}`,
				valid: false,
			};
		}
		return { valid: true };
	};
}

export function maxDuration(seconds: number): Validator {
	return (file) => {
		if (!file.raw) {
			return { valid: true };
		}

		return new Promise<ValidationResult>((resolve) => {
			const video = document.createElement("video");
			video.preload = "metadata";

			const objectUrl = URL.createObjectURL(file.raw!);

			video.onloadedmetadata = () => {
				URL.revokeObjectURL(objectUrl);
				if (video.duration > seconds) {
					resolve({
						reason: `Video exceeds maximum duration of ${seconds}s (got ${Math.round(video.duration)}s)`,
						valid: false,
					});
				} else {
					resolve({ valid: true });
				}
			};

			video.onerror = () => {
				URL.revokeObjectURL(objectUrl);
				resolve({ valid: true });
			};

			video.src = objectUrl;
		});
	};
}

export function composeValidators(...validators: Validator[]): Validator {
	return async (file) => {
		for (const validator of validators) {
			const result = await validator(file);
			if (!result.valid) return result;
		}
		return { valid: true };
	};
}
