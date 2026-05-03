import { UploadProvider } from "@hyperserve/video-uploader";
import { DropZone } from "@hyperserve/video-uploader-react";
import { useMemo } from "react";
import { createMockConfig } from "./MockAdapter";

export default function ThemingDropZoneDemo() {
	const config = useMemo(() => createMockConfig(), []);
	return (
		<div
			className="not-content"
			style={{
				background: "#0f172a",
				border: "1px solid #1e293b",
				borderRadius: 8,
				padding: "1.5rem",
			}}
		>
			<UploadProvider config={config}>
				<DropZone
					styles={{
						activeRoot: {
							background: "#1e1b4b",
							borderColor: "#818cf8",
							borderStyle: "solid",
						},
						browseText: { color: "#818cf8" },
						primaryText: { color: "#f1f5f9" },
						root: {
							background: "#1e293b",
							border: "1px dashed #334155",
							borderRadius: 8,
						},
						supportingText: { color: "#64748b" },
					}}
					supportingText="MP4 up to 500 MB"
				/>
			</UploadProvider>
		</div>
	);
}
