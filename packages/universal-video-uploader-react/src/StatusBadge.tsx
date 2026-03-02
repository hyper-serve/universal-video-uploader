import React from "react";
import type { FileStatus } from "@hyperserve/universal-video-uploader";
import { statusConfig } from "./utils.js";

export type StatusBadgeProps = {
	status: FileStatus;
	style?: React.CSSProperties;
	className?: string;
	children?: (info: { label: string; color: string }) => React.ReactNode;
};

export function StatusBadge({
	status,
	style,
	className,
	children,
}: StatusBadgeProps) {
	const config = statusConfig[status];

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
