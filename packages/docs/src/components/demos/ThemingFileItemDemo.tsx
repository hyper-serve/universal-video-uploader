import { FileItem } from "@hyperserve/video-uploader-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { failedFile, uploadingFile } from "./mockFileState";

const files = [uploadingFile, failedFile];

export default function ThemingFileItemDemo() {
	return (
		<MockFilesProvider files={files}>
			<div
				className="not-content"
				style={{
					background: "#0f172a",
					border: "1px solid #1e293b",
					borderRadius: 8,
					display: "flex",
					flexDirection: "column",
					gap: "0.75rem",
					padding: "1.5rem",
				}}
			>
				{files.map((file) => (
					<FileItem
						file={file}
						key={file.id}
						layout="column"
						styles={{
							errorMessage: { color: "#f87171" },
							fileName: { color: "#f1f5f9" },
							fileSize: { color: "#64748b" },
							progressFill: {
								background: "linear-gradient(90deg, #818cf8, #a78bfa)",
							},
							root: { background: "#1e293b", border: "1px solid #334155" },
							statusIcon: { color: "#818cf8" },
						}}
					>
						<FileItem.Content />
					</FileItem>
				))}
			</div>
		</MockFilesProvider>
	);
}
