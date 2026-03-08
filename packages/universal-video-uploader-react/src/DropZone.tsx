import React, { useCallback, useRef, useState } from "react";
import {
	toFileRefs,
	useUpload,
} from "@hyperserve/universal-video-uploader";
import { filterFilesByAccept } from "./acceptFilter.js";

const UPLOAD_ICON = (
	<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
		<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
		<polyline points="17 8 12 3 7 8" />
		<line x1="12" y1="3" x2="12" y2="15" />
	</svg>
);

export type DropZoneProps = {
	accept?: string;
	multiple?: boolean;
	disabled?: boolean;
	style?: React.CSSProperties;
	activeStyle?: React.CSSProperties;
	className?: string;
	activeClassName?: string;
	supportingText?: React.ReactNode;
	children?:
		| React.ReactNode
		| ((state: { isDragging: boolean; openPicker: () => void }) => React.ReactNode);
};

export function DropZone({
	accept = "video/*",
	multiple = true,
	disabled = false,
	style,
	activeStyle,
	className,
	activeClassName,
	supportingText,
	children,
}: DropZoneProps) {
	const { addFiles, canAddMore } = useUpload();
	const [isDragging, setIsDragging] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const isDisabled = disabled || canAddMore === false;

	const openPicker = useCallback(() => {
		if (isDisabled) return;
		inputRef.current?.click();
	}, [isDisabled]);

	const handleFiles = useCallback(
		(fileList: FileList | File[]) => {
			const files = Array.from(fileList);
			if (files.length > 0) {
				addFiles(toFileRefs(files));
			}
		},
		[addFiles],
	);

	const handleDragOver = useCallback(
		(e: React.DragEvent) => {
		e.preventDefault();
		if (isDisabled) return;
		setIsDragging(true);
		},
		[isDisabled],
	);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		if (e.currentTarget.contains(e.relatedTarget as Node)) return;
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			if (isDisabled) return;
			const raw = Array.from(e.dataTransfer.files);
			const filtered = filterFilesByAccept(raw, accept);
			if (filtered.length > 0) {
				handleFiles(filtered);
			}
		},
		[handleFiles, accept, isDisabled],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (isDisabled) return;
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				openPicker();
			}
		},
		[isDisabled, openPicker],
	);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (e.target.files) {
				handleFiles(e.target.files);
				e.target.value = "";
			}
		},
		[handleFiles],
	);

	const resolvedClassName = isDragging && activeClassName
		? `${className ?? ""} ${activeClassName}`.trim()
		: className;

	const resolvedStyle: React.CSSProperties = {
		alignItems: "center",
		backgroundColor: isDragging ? "#f0f4ff" : "#fafafa",
		border: "1.5px dashed #d1d5db",
		borderRadius: 12,
		cursor: isDisabled ? "not-allowed" : "pointer",
		display: "flex",
		flexDirection: "column",
		gap: "0.375rem",
		justifyContent: "center",
		minHeight: 160,
		opacity: isDisabled ? 0.6 : 1,
		padding: "1.5rem",
		pointerEvents: isDisabled ? "none" : undefined,
		transition: "border-color 0.2s ease, background-color 0.2s ease",
		...style,
		...(isDragging
			? { backgroundColor: "#f0f4ff", borderColor: "#5589F1", ...activeStyle }
			: {}),
	};

	return (
		<div
			aria-disabled={isDisabled}
			className={resolvedClassName}
			onClick={openPicker}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
			onKeyDown={handleKeyDown}
			role="button"
			style={resolvedStyle}
			tabIndex={isDisabled ? -1 : 0}
		>
			<input
				accept={accept}
				multiple={multiple}
				onChange={handleInputChange}
				ref={inputRef}
				style={{ display: "none" }}
				type="file"
			/>
			{typeof children === "function"
				? children({ isDragging, openPicker })
				: children ?? (
						<>
							<div style={{ color: "#5589F1", lineHeight: 1 }}>{UPLOAD_ICON}</div>
							<div style={{ color: "#374151", fontSize: "0.9375rem", fontWeight: 600 }}>
								{isDragging ? "Drop your videos here" : "Drop videos here or "}
								{!isDragging && (
									<span style={{ color: "#5589F1", fontWeight: 600 }}>browse</span>
								)}
							</div>
							{supportingText != null && (
								<div style={{ color: "#9ca3af", fontSize: "0.8125rem" }}>
									{supportingText}
								</div>
							)}
						</>
					)}
		</div>
	);
}
