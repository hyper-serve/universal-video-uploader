import { Thumbnail } from "@hyperserve/upload-react";
import type React from "react";
import { THUMB_SVG, VIDEO_URL, mockFile } from "./mockFileState";

const cases: { label: string; file: ReturnType<typeof mockFile> }[] = [
	{
		file: mockFile({ id: "thumb-1", status: "uploading" }),
		label: "Placeholder",
	},
	{
		file: mockFile({
			id: "thumb-2",
			status: "uploading",
			thumbnailUri: THUMB_SVG,
		}),
		label: "Image",
	},
	{
		file: mockFile({ id: "thumb-3", status: "ready" }),
		label: "Ready (no URL)",
	},
	{
		file: mockFile({
			id: "thumb-4",
			playbackUrl: VIDEO_URL,
			status: "ready",
			thumbnailUri: THUMB_SVG,
		}),
		label: "Playback",
	},
];

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

export default function ThumbnailDemo() {
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
			{cases.map(({ label, file }) => (
				<div key={file.id} style={col}>
					<Thumbnail file={file} playback style={{ width: 160 }} />
					<span style={labelStyle}>{label}</span>
				</div>
			))}
		</div>
	);
}
