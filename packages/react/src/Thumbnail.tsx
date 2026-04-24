import type React from "react";
import { useEffect, useState } from "react";
import type { FileState } from "@hyperserve/upload";
import { ThumbnailPlaceholderIcon } from "./icons.js";
import { colors, radius, thumbnailShadow } from "./theme.js";

export type ThumbnailProps = {
	file: FileState;
	playback?: boolean;
	controls?: boolean;
	style?: React.CSSProperties;
	className?: string;
	placeholderStyle?: React.CSSProperties;
	placeholderClassName?: string;
	placeholder?: React.ReactNode;
	children?: (info: {
		thumbnailUri: string | null;
		playbackUrl: string | null;
		isReady: boolean;
	}) => React.ReactNode;
};

export function Thumbnail({
	file,
	playback = false,
	controls = true,
	style,
	className,
	placeholderStyle,
	placeholderClassName,
	placeholder,
	children,
}: ThumbnailProps) {
	const isReady = file.status === "ready";
	const [thumbnailLoadFailed, setThumbnailLoadFailed] = useState(false);

	useEffect(() => {
		setThumbnailLoadFailed(false);
	}, [file.thumbnailUri, file.id]);

	if (children) {
		return (
			<>
				{children({
					isReady,
					playbackUrl: file.playbackUrl,
					thumbnailUri: file.thumbnailUri,
				})}
			</>
		);
	}

	if (playback && isReady && file.playbackUrl) {
		return (
			<video
				className={className}
				controls={controls}
				src={file.playbackUrl}
				style={{
					borderRadius: radius.md,
					boxShadow: thumbnailShadow,
					maxHeight: 300,
					width: "100%",
					...style,
				}}
			>
				<track kind="captions" />
			</video>
		);
	}

	if (file.thumbnailUri && !thumbnailLoadFailed) {
		return (
			<img
				alt={file.ref.name}
				className={className}
				onError={() => setThumbnailLoadFailed(true)}
				src={file.thumbnailUri}
				style={{
					borderRadius: radius.md,
					height: 100,
					objectFit: "cover",
					width: "100%",
					...style,
				}}
			/>
		);
	}

	return (
		<div
			className={placeholderClassName}
			style={{
				alignItems: "center",
				backgroundColor: colors.bgPlaceholder,
				border: `1px solid ${colors.borderPlaceholder}`,
				borderRadius: radius.md,
				display: "flex",
				height: 100,
				justifyContent: "center",
				minWidth: 80,
				...placeholderStyle,
				...style,
			}}
		>
			{placeholder !== undefined ? placeholder : <ThumbnailPlaceholderIcon />}
		</div>
	);
}
