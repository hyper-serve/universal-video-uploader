import React from "react";
import type { FileStatus, UploadConfig } from "@hyperserve/universal-video-uploader";

export const CONFIG: Pick<UploadConfig, "apiKey" | "baseUrl"> = {
	apiKey: "YOUR_HYPERSERVE_API_KEY",
	baseUrl: "https://api.hyperserve.io/v1",
};

const statusColors: Record<FileStatus, { bg: string; text: string }> = {
	failed: { bg: "#fef2f2", text: "#ef4444" },
	processing: { bg: "#fffbeb", text: "#f59e0b" },
	ready: { bg: "#f0fdf4", text: "#22c55e" },
	selected: { bg: "#f8fafc", text: "#94a3b8" },
	uploading: { bg: "#eff6ff", text: "#3b82f6" },
	validating: { bg: "#f5f3ff", text: "#8b5cf6" },
};

export function StatusBadge({ status }: { status: FileStatus }) {
	const colors = statusColors[status];
	return (
		<span
			style={{
				background: colors.bg,
				borderRadius: 9999,
				color: colors.text,
				fontSize: "0.75rem",
				fontWeight: 600,
				padding: "0.2rem 0.6rem",
			}}
		>
			{status}
		</span>
	);
}

export function ProgressBar({ progress }: { progress: number }) {
	return (
		<div
			style={{
				background: "#e2e8f0",
				borderRadius: 4,
				height: 6,
				overflow: "hidden",
				width: "100%",
			}}
		>
			<div
				style={{
					background: "#3b82f6",
					borderRadius: 4,
					height: "100%",
					transition: "width 0.3s ease",
					width: `${progress}%`,
				}}
			/>
		</div>
	);
}
