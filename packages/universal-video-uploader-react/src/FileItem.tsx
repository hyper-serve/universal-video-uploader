import React, { createContext, useContext } from "react";
import type { FileState } from "@hyperserve/universal-video-uploader";
import { useUpload } from "@hyperserve/universal-video-uploader";

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
	style?: React.CSSProperties;
	className?: string;
	children?:
		| React.ReactNode
		| ((file: FileState) => React.ReactNode);
};

export function FileItem({ file, style, className, children }: FileItemProps) {
	return (
		<FileItemContext.Provider value={{ file }}>
			<div
				className={className}
				style={{
					backgroundColor: "#f8fafc",
					border: "1px solid #e2e8f0",
					borderRadius: 8,
					display: "flex",
					flexDirection: "column",
					gap: "0.5rem",
					padding: "1rem",
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
				fontWeight: 500,
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
	const mb = file.ref.size / (1024 * 1024);
	return (
		<span
			className={className}
			style={{ color: "#94a3b8", fontSize: "0.8rem", ...style }}
		>
			{mb < 1 ? `${(file.ref.size / 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`}
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
			style={{ color: "#ef4444", fontSize: "0.85rem", ...style }}
		>
			{file.error}
		</div>
	);
}

export type RemoveButtonProps = {
	style?: React.CSSProperties;
	className?: string;
	children?: React.ReactNode;
};

function RemoveButton({ style, className, children }: RemoveButtonProps) {
	const { file } = useFileItemContext();
	const { removeFile } = useUpload();
	return (
		<button
			className={className}
			onClick={() => removeFile(file.id)}
			style={{
				background: "none",
				border: "none",
				color: "#ef4444",
				cursor: "pointer",
				fontSize: "0.8rem",
				padding: "0.25rem",
				...style,
			}}
			type="button"
		>
			{children ?? "Remove"}
		</button>
	);
}

export type RetryButtonProps = {
	style?: React.CSSProperties;
	className?: string;
	children?: React.ReactNode;
};

function RetryButton({ style, className, children }: RetryButtonProps) {
	const { file } = useFileItemContext();
	const { retryFile } = useUpload();
	if (file.status !== "failed") return null;
	return (
		<button
			className={className}
			onClick={() => retryFile(file.id)}
			style={{
				background: "none",
				border: "none",
				color: "#3b82f6",
				cursor: "pointer",
				fontSize: "0.8rem",
				padding: "0.25rem",
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
