import { ProgressBar } from "@hyperserve/upload-react";
import type React from "react";

const values = [0, 33, 67, 100];

export default function ProgressBarDemo() {
	return (
		<div
			style={{
				background: "#fff",
				border: "1px solid #e2e8f0",
				borderRadius: 8,
				display: "flex",
				flexDirection: "column",
				gap: "1.25rem",
				padding: "1.5rem",
			}}
		>
			{values.map((v) => (
				<div
					key={v}
					style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}
				>
					<span
						style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}
					>
						{v}%
					</span>
					<ProgressBar progress={v} />
				</div>
			))}
		</div>
	);
}
