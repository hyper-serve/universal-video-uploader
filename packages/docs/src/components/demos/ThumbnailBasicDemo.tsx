import { Thumbnail } from "@hyperserve/upload-react";
import type React from "react";
import { THUMB_URL, mockFile } from "./mockFileState";

const col: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "0.5rem",
};

const label: React.CSSProperties = {
	color: "#64748b",
	fontSize: "0.75rem",
	fontWeight: 500,
	textAlign: "center",
};

export default function ThumbnailBasicDemo() {
	return (
		<div
			className="not-content"
			style={{
				background: "#fff",
				border: "1px solid #e2e8f0",
				borderRadius: 8,
				display: "flex",
				flexWrap: "wrap",
				gap: "1.25rem",
				padding: "1.5rem",
			}}
		>
			<div style={col}>
				<Thumbnail
					file={mockFile({ id: "with-thumb", thumbnailUri: THUMB_URL })}
					style={{ width: 160 }}
				/>
				<span style={label}>Thumbnail</span>
			</div>
			<div style={col}>
				<Thumbnail file={mockFile({ id: "placeholder" })} style={{ width: 160 }} />
				<span style={label}>Placeholder</span>
			</div>
		</div>
	);
}
