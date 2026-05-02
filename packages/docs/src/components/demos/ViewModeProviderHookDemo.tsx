import { FileList, useViewMode } from "@hyperserve/upload-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { mockFileList } from "./mockFileState";

function MyViewToggle() {
	const { viewMode, setViewMode } = useViewMode();
	return (
		<button
			onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
			style={{
				background: "#f8fafc",
				border: "1px solid #e2e8f0",
				borderRadius: 6,
				cursor: "pointer",
				fontSize: "0.875rem",
				padding: "0.375rem 0.75rem",
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
			<MockFilesProvider files={mockFileList}>
				<MyViewToggle />
				<FileList />
			</MockFilesProvider>
		</div>
	);
}
