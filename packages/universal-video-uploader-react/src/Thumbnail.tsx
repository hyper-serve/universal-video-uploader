import React from "react";
import type { FileState } from "@hyperserve/universal-video-uploader";

export type ThumbnailProps = {
	file: FileState;
	playback?: boolean;
	style?: React.CSSProperties;
	className?: string;
	placeholderStyle?: React.CSSProperties;
	placeholderClassName?: string;
	children?: (info: {
		thumbnailUri: string | null;
		playbackUrl: string | null;
		isReady: boolean;
	}) => React.ReactNode;
};

export function Thumbnail({
	file,
	playback = false,
	style,
	className,
	placeholderStyle,
	placeholderClassName,
	children,
}: ThumbnailProps) {
	const isReady = file.status === "ready";

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
				controls
				src={file.playbackUrl}
				style={{
					borderRadius: 8,
					maxHeight: 300,
					width: "100%",
					...style,
				}}
			>
				<track kind="captions" />
			</video>
		);
	}

	if (file.thumbnailUri) {
		return (
			<video
				className={className}
				muted
				src={file.thumbnailUri}
				style={{
					borderRadius: 6,
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
				backgroundColor: "#f1f5f9",
				borderRadius: 6,
				display: "flex",
				fontSize: "2rem",
				height: 100,
				justifyContent: "center",
				...placeholderStyle,
			}}
		>
			&#x1F3AC;
		</div>
	);
}
