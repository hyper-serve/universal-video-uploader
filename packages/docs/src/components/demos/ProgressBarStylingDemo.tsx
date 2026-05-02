import { ProgressBar } from "@hyperserve/video-uploader-react";

export default function ProgressBarStylingDemo() {
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
			<ProgressBar
				progress={75}
				trackStyle={{ height: 8, borderRadius: 4 }}
				fillStyle={{ background: "linear-gradient(90deg, #06b6d4, #3b82f6)" }}
			/>
		</div>
	);
}
