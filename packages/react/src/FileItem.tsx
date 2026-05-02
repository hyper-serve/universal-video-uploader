import type { FileState } from "@hyperserve/video-uploader";
import { useUpload } from "@hyperserve/video-uploader";
import type React from "react";
import { createContext, useContext } from "react";
import { formatFileSize } from "./fileFormatters.js";
import { CheckCircleIcon, RetryIcon, SpinnerIcon } from "./icons.js";
import { ProgressBar } from "./ProgressBar.js";
import { Thumbnail } from "./Thumbnail.js";
import { colors, radius } from "./theme.js";

type FileItemContextValue = {
	file: FileState;
	layout: "row" | "column";
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
	children?: React.ReactNode | ((file: FileState) => React.ReactNode);
};

export function FileItem({
	file,
	layout = "column",
	style,
	className,
	children,
}: FileItemProps) {
	const isRow = layout === "row";
	return (
		<FileItemContext.Provider value={{ file, layout }}>
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
	cancelLabel?: string;
};

function RemoveButton({
	style,
	className,
	children,
	ariaLabel,
	cancelLabel = "Cancel",
}: RemoveButtonProps) {
	const { file } = useFileItemContext();
	const { removeFile } = useUpload();
	if (file.status === "processing" || file.status === "ready") {
		return null;
	}
	const isActive = file.status === "uploading" || file.status === "validating";
	const label = isActive ? cancelLabel : "Remove";
	return (
		<button
			aria-label={ariaLabel ?? label}
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
			aria-label={ariaLabel ?? "Retry"}
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
			{children ?? <RetryIcon />}
		</button>
	);
}

export type StatusIconProps = {
	style?: React.CSSProperties;
	className?: string;
};

function StatusIcon({ style, className }: StatusIconProps) {
	const { file } = useFileItemContext();
	if (file.status === "processing") {
		return (
			<span
				className={className}
				style={{
					alignItems: "center",
					color: "#9CA3AF",
					display: "inline-flex",
					gap: 4,
					...style,
				}}
			>
				<SpinnerIcon />
				<span style={{ fontSize: "0.8125rem" }}>Processing...</span>
			</span>
		);
	}
	if (file.status === "ready") {
		return (
			<span
				className={className}
				style={{ color: "#059669", display: "inline-flex", ...style }}
			>
				<CheckCircleIcon />
			</span>
		);
	}
	return null;
}

export type FileItemMetaProps = {
	style?: React.CSSProperties;
	className?: string;
	children?: React.ReactNode;
};

function Meta({ style, className, children }: FileItemMetaProps) {
	return (
		<div
			className={className}
			style={{ alignItems: "center", display: "flex", gap: 6, ...style }}
		>
			{children}
		</div>
	);
}

export type FileItemActionsProps = {
	style?: React.CSSProperties;
	className?: string;
	children?: React.ReactNode;
};

function Actions({ style, className, children }: FileItemActionsProps) {
	return (
		<div
			className={className}
			style={{
				alignItems: "flex-end",
				display: "flex",
				flexDirection: "column",
				gap: 4,
				...style,
			}}
		>
			{children}
		</div>
	);
}

export type UploadProgressProps = {
	trackStyle?: React.CSSProperties;
	trackClassName?: string;
	fillStyle?: React.CSSProperties;
	fillClassName?: string;
};

function UploadProgress({
	trackStyle,
	trackClassName,
	fillStyle,
	fillClassName,
}: UploadProgressProps) {
	const { file } = useFileItemContext();
	if (file.status !== "uploading") return null;
	return (
		<ProgressBar
			fillClassName={fillClassName}
			fillStyle={fillStyle}
			progress={file.progress}
			trackClassName={trackClassName}
			trackStyle={trackStyle}
		/>
	);
}

export type PlaybackPreviewProps = {
	style?: React.CSSProperties;
	className?: string;
};

function PlaybackPreview({ style, className }: PlaybackPreviewProps) {
	const { file } = useFileItemContext();
	if (file.status !== "ready" || !file.playbackUrl) return null;
	return <Thumbnail className={className} file={file} playback style={style} />;
}

export type FileItemContentProps = {
	style?: React.CSSProperties;
	className?: string;
};

function Content({ style, className }: FileItemContentProps) {
	const { file, layout } = useFileItemContext();
	const isRow = layout === "row";

	if (isRow) {
		return (
			<>
				<Thumbnail
					file={file}
					playback
					style={{ flexShrink: 0, height: 72, width: 128 }}
				/>
				<div
					className={className}
					style={{
						display: "flex",
						flex: 1,
						flexDirection: "column",
						gap: 2,
						minWidth: 0,
						...style,
					}}
				>
					<FileName />
					<Meta>
						<FileSize />
						<StatusIcon />
					</Meta>
					<UploadProgress trackStyle={{ marginTop: 2 }} />
					<ErrorMessage />
				</div>
				<Actions>
					<RemoveButton />
					<RetryButton />
				</Actions>
			</>
		);
	}

	return (
		<div className={className} style={style}>
			<Thumbnail file={file} playback />
			<div
				style={{
					alignItems: "center",
					display: "flex",
					justifyContent: "space-between",
					marginTop: "0.5rem",
				}}
			>
				<FileName />
				<Actions>
					<RemoveButton />
					<RetryButton />
				</Actions>
			</div>
			<Meta>
				<FileSize />
				<StatusIcon />
			</Meta>
			<UploadProgress />
			<ErrorMessage />
		</div>
	);
}

FileItem.FileName = FileName;
FileItem.FileSize = FileSize;
FileItem.ErrorMessage = ErrorMessage;
FileItem.RemoveButton = RemoveButton;
FileItem.RetryButton = RetryButton;
FileItem.StatusIcon = StatusIcon;
FileItem.Meta = Meta;
FileItem.Actions = Actions;
FileItem.UploadProgress = UploadProgress;
FileItem.PlaybackPreview = PlaybackPreview;
FileItem.Content = Content;
