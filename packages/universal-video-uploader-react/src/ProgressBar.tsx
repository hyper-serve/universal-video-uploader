import React from "react";

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
				backgroundColor: "#e5e7eb",
				borderRadius: 4,
				height: 6,
				overflow: "hidden",
				width: "100%",
				...trackStyle,
			}}
		>
			<div
				className={fillClassName}
				style={{
					backgroundColor: "#5589F1",
					borderRadius: 4,
					height: "100%",
					transition: "width 0.25s ease-out",
					width: `${progress}%`,
					...fillStyle,
				}}
			/>
		</div>
	);
}
