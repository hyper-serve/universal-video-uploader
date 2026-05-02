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
					style={{ background: "#1e293b", border: "1px dashed #334155" }}
					activeStyle={{ background: "#1e1b4b", borderColor: "#818cf8" }}
				/>
			</UploadProvider>
		</div>
	);
}
