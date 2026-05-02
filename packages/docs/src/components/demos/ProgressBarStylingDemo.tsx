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
				fillStyle={{ background: "linear-gradient(90deg, #06b6d4, #3b82f6)" }}
				progress={75}
				trackStyle={{ borderRadius: 4, height: 8 }}
			/>
		</div>
	);
}
