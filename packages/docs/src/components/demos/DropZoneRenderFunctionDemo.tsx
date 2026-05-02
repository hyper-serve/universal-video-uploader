import { UploadProvider } from "@hyperserve/upload";
import { DropZone } from "@hyperserve/upload-react";
import { useMemo } from "react";
import { createMockConfig } from "./MockAdapter";

export default function DropZoneRenderFunctionDemo() {
	const config = useMemo(() => createMockConfig(), []);
	return (
		<div
			className="not-content"
			style={{
				background: "#fff",
				border: "1px solid #e2e8f0",
				borderRadius: 8,
				padding: "1.5rem",
			}}
		>
			<UploadProvider config={config}>
				<DropZone>
					{({ isDragging, openPicker }) => (
						<div
							style={{
								alignItems: "center",
								display: "flex",
								flexDirection: "column",
								gap: "0.75rem",
								padding: "1rem",
								textAlign: "center",
							}}
						>
							<span style={{ color: "#64748b", fontSize: "0.875rem" }}>
								{isDragging ? "Release to upload" : "Custom drop zone UI"}
							</span>
							<button
								onClick={openPicker}
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
								Select Files
							</button>
						</div>
					)}
				</DropZone>
			</UploadProvider>
		</div>
	);
}
