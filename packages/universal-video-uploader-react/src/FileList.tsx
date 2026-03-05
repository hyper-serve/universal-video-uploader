import React from "react";
import type { FileState, ViewMode } from "@hyperserve/universal-video-uploader";
import { useUpload } from "@hyperserve/universal-video-uploader";

export type FileListProps = {
	mode?: ViewMode;
	style?: React.CSSProperties;
	className?: string;
	columns?: string;
	emptyMessage?: React.ReactNode;
	emptyClassName?: string;
	emptyStyle?: React.CSSProperties;
	renderEmpty?: () => React.ReactNode;
	children: (file: FileState, index: number) => React.ReactNode;
};

const defaultEmptyStyle: React.CSSProperties = {
	color: "#94a3b8",
	padding: "2rem 0",
	textAlign: "center",
};

export function FileList({
	mode,
	style,
	className,
	columns = "repeat(auto-fill, minmax(180px, 1fr))",
	emptyMessage,
	emptyClassName,
	emptyStyle,
	renderEmpty,
	children,
}: FileListProps) {
	const { files, viewMode } = useUpload();
	const resolvedMode = mode ?? viewMode;

	if (files.length === 0) {
		if (renderEmpty) {
			return <>{renderEmpty()}</>;
		}
		if (emptyMessage) {
			return (
				<div
					className={emptyClassName}
					style={{ ...defaultEmptyStyle, ...emptyStyle }}
				>
					{emptyMessage}
				</div>
			);
		}
	}

	const listStyle: React.CSSProperties =
		resolvedMode === "grid"
			? {
					display: "grid",
					gap: "1rem",
					gridTemplateColumns: columns,
					...style,
				}
			: {
					display: "flex",
					flexDirection: "column",
					gap: "0.75rem",
					...style,
				};

	return (
		<div className={className} style={listStyle}>
			{files.map((file, i) => children(file, i))}
		</div>
	);
}
