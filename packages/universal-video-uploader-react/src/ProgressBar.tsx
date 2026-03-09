import React from "react";
import { colors, radius } from "./theme.js";

export type ProgressBarProps = {
	progress: number;
	trackStyle?: React.CSSProperties;
	fillStyle?: React.CSSProperties;
	trackClassName?: string;
	fillClassName?: string;
	children?: (progress: number) => React.ReactNode;
};

export function ProgressBar({
	progress,
	trackStyle,
	fillStyle,
	trackClassName,
	fillClassName,
	children,
}: ProgressBarProps) {
	if (children) {
		return <>{children(progress)}</>;
	}

	return (
		<div
			aria-valuemax={100}
			aria-valuemin={0}
			aria-valuenow={progress}
			className={trackClassName}
			role="progressbar"
			style={{
				backgroundColor: colors.border,
				borderRadius: radius.sm,
				height: 6,
				overflow: "hidden",
				width: "100%",
				...trackStyle,
			}}
		>
			<div
				className={fillClassName}
				style={{
					backgroundColor: colors.accent,
					borderRadius: radius.sm,
					height: "100%",
					transition: "width 0.25s ease-out",
					width: `${progress}%`,
					...fillStyle,
				}}
			/>
		</div>
	);
}
