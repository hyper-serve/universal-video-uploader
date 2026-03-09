import React, { createContext, useContext } from "react";
import type { FileState } from "@hyperserve/universal-video-uploader";
import { useUpload } from "@hyperserve/universal-video-uploader";
import { formatFileSize } from "./fileFormatters.js";
import { colors, radius } from "./theme.js";

type FileItemContextValue = {
	file: FileState;
};

const FileItemContext = createContext<FileItemContextValue | null>(null);

function useFileItemContext(): FileItemContextValue {
	const ctx = useContext(FileItemContext);
	if (!ctx) {
		throw new Error(
			"FileItem compound components must be used within <FileItem>",
		);
	}
	return ctx;
}

export type FileItemProps = {
	file: FileState;
	layout?: "row" | "column";
	style?: React.CSSProperties;
	className?: string;
	children?:
	| React.ReactNode
	| ((file: FileState) => React.ReactNode);
};

export function FileItem({ file, layout = "column", style, className, children }: FileItemProps) {
	const isRow = layout === "row";
	return (
		<FileItemContext.Provider value={{ file }}>
			<div
				className={className}
				style={{
					alignItems: isRow ? "center" : undefined,
					backgroundColor: colors.bgCard,
					border: `1px solid ${colors.border}`,
					borderRadius: radius.lg,
					display: "flex",
					flexDirection: isRow ? "row" : "column",
					gap: isRow ? 12 : "0.5rem",
					padding: isRow ? "0.75rem 1rem" : "0.875rem 1rem",
					...style,
				}}
			>
				{typeof children === "function" ? children(file) : children}
			</div>
		</FileItemContext.Provider>
	);
}

export type FileNameProps = {
	style?: React.CSSProperties;
	className?: string;
};

function FileName({ style, className }: FileNameProps) {
	const { file } = useFileItemContext();
	return (
		<span
			className={className}
			style={{
				fontSize: "0.875rem",
				fontWeight: 600,
				overflow: "hidden",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap",
				...style,
			}}
		>
			{file.ref.name}
		</span>
	);
}

export type FileSizeProps = {
	style?: React.CSSProperties;
	className?: string;
};

function FileSize({ style, className }: FileSizeProps) {
	const { file } = useFileItemContext();
	return (
		<span
			className={className}
			style={{ color: colors.textSecondary, fontSize: "0.8125rem", ...style }}
		>
			{formatFileSize(file.ref.size)}
		</span>
	);
}

export type ErrorMessageProps = {
	style?: React.CSSProperties;
	className?: string;
};

function ErrorMessage({ style, className }: ErrorMessageProps) {
	const { file } = useFileItemContext();
	if (!file.error) return null;
	return (
		<div
			className={className}
			style={{ color: colors.error, fontSize: "0.8125rem", ...style }}
		>
			{file.error}
		</div>
	);
}

export type RemoveButtonProps = {
	style?: React.CSSProperties;
	className?: string;
	children?: React.ReactNode;
	ariaLabel?: string;
};

function RemoveButton({
	style,
	className,
	children,
	ariaLabel,
}: RemoveButtonProps) {
	const { file } = useFileItemContext();
	const { removeFile } = useUpload();
	if (file.status === "processing" || file.status === "ready") {
		return null;
	}
	return (
		<button
			aria-label={ariaLabel ?? "Remove"}
			className={className}
			onClick={() => removeFile(file.id)}
			style={{
				background: "none",
				border: "none",
				color: colors.textSecondary,
				cursor: "pointer",
				fontSize: "1.125rem",
				lineHeight: 1,
				padding: "0.25rem",
				transition: "color 0.15s ease",
				...style,
			}}
			type="button"
		>
			{children ?? "×"}
		</button>
	);
}

export type RetryButtonProps = {
	style?: React.CSSProperties;
	className?: string;
	children?: React.ReactNode;
	ariaLabel?: string;
};

function RetryButton({
	style,
	className,
	children,
	ariaLabel,
}: RetryButtonProps) {
	const { file } = useFileItemContext();
	const { retryFile } = useUpload();
	if (file.status !== "failed") return null;
	return (
		<button
			aria-label={ariaLabel}
			className={className}
			onClick={() => retryFile(file.id)}
			style={{
				background: "none",
				border: "none",
				color: colors.accent,
				cursor: "pointer",
				fontSize: "0.8125rem",
				padding: "0.25rem 0",
				transition: "opacity 0.15s ease",
				...style,
			}}
			type="button"
		>
			{children ?? "Retry"}
		</button>
	);
}

FileItem.FileName = FileName;
FileItem.FileSize = FileSize;
FileItem.ErrorMessage = ErrorMessage;
FileItem.RemoveButton = RemoveButton;
FileItem.RetryButton = RetryButton;
