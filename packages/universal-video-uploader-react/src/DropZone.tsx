import React, { useCallback, useRef, useState } from "react";
import {
	toFileRefs,
	useUpload,
} from "@hyperserve/universal-video-uploader";
import { filterFilesByAccept } from "./acceptFilter.js";

export type DropZoneProps = {
	accept?: string;
	multiple?: boolean;
	disabled?: boolean;
	style?: React.CSSProperties;
	activeStyle?: React.CSSProperties;
	className?: string;
	activeClassName?: string;
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
		border: "2px dashed #cbd5e1",
		borderRadius: 12,
		cursor: isDisabled ? "not-allowed" : "pointer",
		display: "flex",
		flexDirection: "column",
		gap: "0.5rem",
		justifyContent: "center",
		minHeight: 160,
		opacity: isDisabled ? 0.6 : 1,
		pointerEvents: isDisabled ? "none" : undefined,
		transition: "border-color 0.2s, background-color 0.2s",
		...style,
		...(isDragging
			? { backgroundColor: "#eff6ff", borderColor: "#3b82f6", ...activeStyle }
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
							<div style={{ fontSize: "2rem" }}>&#x1F3AC;</div>
							<div style={{ color: "#64748b", fontSize: "0.9rem" }}>
								{isDragging
									? "Drop your videos here"
									: "Drag & drop video files, or click to browse"}
							</div>
						</>
					)}
		</div>
	);
}
