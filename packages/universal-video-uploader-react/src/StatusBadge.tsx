import React from "react";
import type { FileStatus } from "@hyperserve/universal-video-uploader";
import { statusConfig } from "./utils.js";

export type StatusConfigEntry = {
	label: string;
	bg?: string;
	text?: string;
};

export type StatusBadgeProps = {
	status: FileStatus;
	style?: React.CSSProperties;
	className?: string;
	statusConfig?: Partial<Record<FileStatus, StatusConfigEntry>>;
	getLabel?: (status: FileStatus) => string;
	children?: (info: { label: string; color: string }) => React.ReactNode;
};

function mergeConfig(
	status: FileStatus,
	overrides?: Partial<Record<FileStatus, StatusConfigEntry>>,
	getLabel?: (status: FileStatus) => string,
): { bg: string; text: string; label: string } {
	const base = statusConfig[status];
	const override = overrides?.[status];
	const merged = {
		bg: override?.bg ?? base.bg,
		text: override?.text ?? base.text,
		label: getLabel ? getLabel(status) : override?.label ?? base.label,
	};
	return merged;
}

export function StatusBadge({
	status,
	style,
	className,
	statusConfig: statusConfigOverride,
	getLabel,
	children,
}: StatusBadgeProps) {
	const config = mergeConfig(status, statusConfigOverride, getLabel);

	if (children) {
		return <>{children({ color: config.text, label: config.label })}</>;
	}

	return (
		<span
			className={className}
			style={{
				backgroundColor: config.bg,
				borderRadius: 9999,
				color: config.text,
				display: "inline-block",
				fontSize: "0.75rem",
				fontWeight: 600,
				lineHeight: 1,
				padding: "0.25rem 0.6rem",
				...style,
			}}
		>
			{config.label.toLowerCase()}
		</span>
	);
}
