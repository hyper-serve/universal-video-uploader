import { Thumbnail } from "@hyperserve/upload-react";
import { mockFile } from "./mockFileState";

export default function ThumbnailBasicDemo() {
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
			<Thumbnail file={mockFile({ id: "basic" })} style={{ width: 160 }} />
		</div>
	);
}
