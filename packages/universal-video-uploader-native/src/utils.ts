import type { FileStatus } from "@hyperserve/universal-video-uploader";

export const statusConfig: Record<
	FileStatus,
	{ bg: string; label: string; text: string }
> = {
	failed: { bg: "#fef2f2", label: "Failed", text: "#dc2626" },
	processing: { bg: "#fffbeb", label: "Processing", text: "#d97706" },
	ready: { bg: "#f0fdf4", label: "Ready", text: "#16a34a" },
	selected: { bg: "#f3f4f6", label: "Selected", text: "#6b7280" },
	uploading: { bg: "#eff6ff", label: "Uploading", text: "#5589F1" },
	validating: { bg: "#f5f3ff", label: "Validating", text: "#7c3aed" },
};
