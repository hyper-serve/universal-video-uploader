import { StatusBadge } from "@hyperserve/upload-react";

const statusConfig = {
	ready: { bg: "#dbeafe", text: "#1d4ed8", label: "Complete" },
	failed: { bg: "#fee2e2", text: "#dc2626", label: "Error" },
};

export default function ThemingStatusConfigDemo() {
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
			<StatusBadge status="uploading" statusConfig={statusConfig} />
			<StatusBadge status="processing" statusConfig={statusConfig} />
			<StatusBadge status="ready" statusConfig={statusConfig} />
			<StatusBadge status="failed" statusConfig={statusConfig} />
		</div>
	);
}
