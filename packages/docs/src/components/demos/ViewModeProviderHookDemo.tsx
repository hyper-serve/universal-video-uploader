import { FileList, useViewMode } from "@hyperserve/upload-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { mockFileList } from "./mockFileState";

function MyViewToggle() {
	const { viewMode, setViewMode } = useViewMode();
	return (
		<button
			onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
			style={{
				background: "#0f172a",
				border: "none",
				borderRadius: 6,
				color: "#fff",
				cursor: "pointer",
				fontSize: "0.875rem",
				padding: "0.375rem 0.875rem",
			}}
			type="button"
		>
			{viewMode === "list" ? "Switch to grid" : "Switch to list"}
		</button>
	);
}

export default function ViewModeProviderHookDemo() {
	return (
		<div
			className="not-content"
			style={{
				background: "#fff",
				border: "1px solid #e2e8f0",
				borderRadius: 8,
				display: "flex",
				flexDirection: "column",
				gap: "1rem",
				padding: "1.5rem",
			}}
		>
			<MockFilesProvider defaultMode="grid" files={mockFileList}>
				<MyViewToggle />
				<FileList />
			</MockFilesProvider>
		</div>
	);
}
