import { Thumbnail } from "@hyperserve/upload-react";
import type React from "react";
import { mockFile } from "./mockFileState";

const THUMB_SVG =
	"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='90'%3E%3Crect width='160' height='90' fill='%23cbd5e1'/%3E%3Ctext x='80' y='48' text-anchor='middle' dominant-baseline='middle' fill='%2394a3b8' font-size='11' font-family='sans-serif'%3Evideo.mp4%3C/text%3E%3C/svg%3E";

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
		label: "Ready (no playback URL)",
	},
];

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
			{cases.map(({ label: l, file }) => (
				<div key={file.id} style={col}>
					<Thumbnail file={file} playback style={{ width: 160 }} />
					<span style={label}>{l}</span>
				</div>
			))}
		</div>
	);
}
