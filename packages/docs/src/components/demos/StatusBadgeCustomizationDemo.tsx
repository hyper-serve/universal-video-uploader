import { StatusBadge } from "@hyperserve/video-uploader-react";

const statusConfig = {
	failed: { bg: "#fee2e2", label: "Failed", text: "#991b1b" },
	processing: { bg: "#ede9fe", label: "Encoding", text: "#5b21b6" },
	ready: { bg: "#d1fae5", label: "Published", text: "#065f46" },
	selected: { bg: "#fef9c3", label: "Queued", text: "#713f12" },
	uploading: { bg: "#dbeafe", label: "In Progress", text: "#1e40af" },
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
