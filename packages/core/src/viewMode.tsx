import React, { createContext, useContext, useState } from "react";

export type ViewMode = "list" | "grid";

type ViewModeContextValue = {
	viewMode: ViewMode;
	setViewMode: (mode: ViewMode) => void;
};

const ViewModeContext = createContext<ViewModeContextValue | null>(null);

export type ViewModeProviderProps = {
	children: React.ReactNode;
	defaultMode?: ViewMode;
};

export function ViewModeProvider({
	children,
	defaultMode = "list",
}: ViewModeProviderProps) {
	const [viewMode, setViewMode] = useState<ViewMode>(defaultMode);
	return (
		<ViewModeContext.Provider value={{ viewMode, setViewMode }}>
			{children}
		</ViewModeContext.Provider>
	);
}

export function useViewMode(): ViewModeContextValue {
	const ctx = useContext(ViewModeContext);
	if (!ctx) {
		return { viewMode: "list", setViewMode: () => {} };
	}
	return ctx;
}
