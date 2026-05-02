import { StatusBadge } from "@hyperserve/video-uploader-react";

const statusConfig = {
	selected: { bg: "#fef9c3", text: "#713f12", label: "Queued" },
	uploading: { bg: "#dbeafe", text: "#1e40af", label: "In Progress" },
	processing: { bg: "#ede9fe", text: "#5b21b6", label: "Encoding" },
	ready: { bg: "#d1fae5", text: "#065f46", label: "Published" },
	failed: { bg: "#fee2e2", text: "#991b1b", label: "Failed" },
};

export default function StatusBadgeCustomizationDemo() {
	return (
		<div
			className="not-content"
			style={{
				alignItems: "center",
				background: "#fff",
				border: "1px solid #e2e8f0",
				borderRadius: 8,
				display: "flex",
				flexWrap: "wrap",
				gap: "0.75rem",
				padding: "1.5rem",
			}}
		>
			<StatusBadge status="selected" statusConfig={statusConfig} />
			<StatusBadge status="uploading" statusConfig={statusConfig} />
			<StatusBadge status="processing" statusConfig={statusConfig} />
			<StatusBadge status="ready" statusConfig={statusConfig} />
			<StatusBadge status="failed" statusConfig={statusConfig} />
		</div>
	);
}
