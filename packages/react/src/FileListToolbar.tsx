import React from "react";
import { useUpload } from "@hyper-serve/upload";
import { GridIcon, ListIcon } from "./icons.js";
import { colors, radius } from "./theme.js";
import { type ViewMode, useViewMode } from "./ViewModeContext.js";

export type FileListToolbarProps = {
	left?: React.ReactNode | null;
	right?: React.ReactNode | null;
	showFileCount?: boolean;
	showViewToggle?: boolean;
	style?: React.CSSProperties;
	className?: string;
};

export type FileCountProps = {
	label?: (count: number) => React.ReactNode;
	style?: React.CSSProperties;
	className?: string;
};

function FileCount({ label, style, className }: FileCountProps) {
	const { files } = useUpload();
	const count = files.length;
	const content =
		label != null ? label(count) : `${count} file${count !== 1 ? "s" : ""} added`;
	return (
		<span
			className={className}
			style={{ color: colors.textPrimary, fontSize: "0.875rem", ...style }}
		>
			{content}
		</span>
	);
}

export type ViewToggleProps = {
	style?: React.CSSProperties;
	className?: string;
	children?: (state: { viewMode: ViewMode; setViewMode: (mode: ViewMode) => void }) => React.ReactNode;
};

function ViewToggle({ style, className, children }: ViewToggleProps) {
	const { viewMode, setViewMode } = useViewMode();
	if (children) {
		return <>{children({ viewMode, setViewMode })}</>;
	}
	return (
		<div
			className={className}
			style={{
				border: `1px solid ${colors.border}`,
				borderRadius: radius.md,
				display: "flex",
				overflow: "hidden",
				...style,
			}}
		>
			<button
				aria-label="List view"
				onClick={() => setViewMode("list")}
				style={{
					alignItems: "center",
					background: viewMode === "list" ? colors.bgSubtle : colors.white,
					border: "none",
					color: viewMode === "list" ? colors.textPrimary : colors.textMuted,
					cursor: "pointer",
					display: "flex",
					justifyContent: "center",
					padding: "0.5rem 0.65rem",
				}}
				type="button"
			>
				<ListIcon />
			</button>
			<button
				aria-label="Grid view"
				onClick={() => setViewMode("grid")}
				style={{
					alignItems: "center",
					background: viewMode === "grid" ? colors.bgSubtle : colors.white,
					border: "none",
					color: viewMode === "grid" ? colors.textPrimary : colors.textMuted,
					cursor: "pointer",
					display: "flex",
					justifyContent: "center",
					padding: "0.5rem 0.65rem",
				}}
				type="button"
			>
				<GridIcon />
			</button>
		</div>
	);
}

export function FileListToolbar({
	left,
	right,
	showFileCount = true,
	showViewToggle = true,
	style,
	className,
}: FileListToolbarProps) {
	const leftContent =
		left !== undefined ? left : showFileCount ? <FileCount /> : null;
	const rightContent =
		right !== undefined ? right : showViewToggle ? <ViewToggle /> : null;

	return (
		<div
			className={className}
			style={{
				alignItems: "center",
				display: "flex",
				justifyContent: "space-between",
				width: "100%",
				...style,
			}}
		>
			{leftContent}
			{rightContent}
		</div>
	);
}

FileListToolbar.FileCount = FileCount;
FileListToolbar.ViewToggle = ViewToggle;
