import { Thumbnail } from "@hyperserve/upload-react";
import type React from "react";
import { THUMB_SVG, mockFile } from "./mockFileState";

const col: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "0.5rem",
};

const labelStyle: React.CSSProperties = {
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
					file={mockFile({ id: "basic-1", thumbnailUri: THUMB_SVG })}
					style={{ width: 160 }}
				/>
				<span style={labelStyle}>With thumbnailUri</span>
			</div>
			<div style={col}>
				<Thumbnail
					file={mockFile({ id: "basic-2" })}
					style={{ width: 160 }}
				/>
				<span style={labelStyle}>Placeholder</span>
			</div>
		</div>
	);
}
