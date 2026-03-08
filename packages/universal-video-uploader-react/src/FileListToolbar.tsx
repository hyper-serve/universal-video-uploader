import React from "react";
import { useUpload, type ViewMode } from "@hyperserve/universal-video-uploader";

function ListIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<line x1="8" y1="6" x2="21" y2="6" />
			<line x1="8" y1="12" x2="21" y2="12" />
			<line x1="8" y1="18" x2="21" y2="18" />
			<line x1="3" y1="6" x2="3.01" y2="6" />
			<line x1="3" y1="12" x2="3.01" y2="12" />
			<line x1="3" y1="18" x2="3.01" y2="18" />
		</svg>
	);
}

function GridIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<rect x="3" y="3" width="7" height="7" rx="1" />
			<rect x="14" y="3" width="7" height="7" rx="1" />
			<rect x="3" y="14" width="7" height="7" rx="1" />
			<rect x="14" y="14" width="7" height="7" rx="1" />
		</svg>
	);
}

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
			style={{ color: "#374151", fontSize: "0.875rem", ...style }}
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
	const { viewMode, setViewMode } = useUpload();
	if (children) {
		return <>{children({ viewMode, setViewMode })}</>;
	}
	return (
		<div
			className={className}
			style={{
				border: "1px solid #e5e7eb",
				borderRadius: 8,
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
					background: viewMode === "list" ? "#f3f4f6" : "#fff",
					border: "none",
					color: viewMode === "list" ? "#374151" : "#9ca3af",
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
					background: viewMode === "grid" ? "#f3f4f6" : "#fff",
					border: "none",
					color: viewMode === "grid" ? "#374151" : "#9ca3af",
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
