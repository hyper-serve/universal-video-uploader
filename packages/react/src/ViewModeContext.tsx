import {
	ViewModeProvider as CoreViewModeProvider,
	type ViewModeProviderProps as CoreViewModeProviderProps,
	useViewMode,
	type ViewMode,
} from "@hyperserve/video-uploader";
import type React from "react";

export type { ViewMode };
export { useViewMode };

export type ViewModeProviderProps = CoreViewModeProviderProps & {
	style?: React.CSSProperties;
	className?: string;
};

export function ViewModeProvider({
	children,
	style,
	className,
	...rest
}: ViewModeProviderProps) {
	return (
		<CoreViewModeProvider {...rest}>
			<div
				className={className}
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "1rem",
					...style,
				}}
			>
				{children}
			</div>
		</CoreViewModeProvider>
	);
}
