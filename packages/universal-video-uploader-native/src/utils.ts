import type { FileStatus } from "@hyperserve/universal-video-uploader";

export const statusConfig: Record<
	FileStatus,
	{ bg: string; label: string; text: string }
> = {
	failed: { bg: "#fef2f2", label: "Failed", text: "#ef4444" },
	processing: { bg: "#fffbeb", label: "Processing", text: "#f59e0b" },
	ready: { bg: "#f0fdf4", label: "Ready", text: "#22c55e" },
	selected: { bg: "#f8fafc", label: "Selected", text: "#94a3b8" },
	uploading: { bg: "#eff6ff", label: "Uploading", text: "#3b82f6" },
	validating: { bg: "#f5f3ff", label: "Validating", text: "#8b5cf6" },
};
