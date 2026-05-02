import { FileItem } from "@hyperserve/upload-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { uploadingFile, failedFile } from "./mockFileState";

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
						style={{ background: "#1e293b", border: "1px solid #334155" }}
					>
						<FileItem.FileName style={{ color: "#f1f5f9" }} />
						<FileItem.FileSize style={{ color: "#64748b" }} />
						<FileItem.StatusIcon style={{ color: "#818cf8" }} />
						<FileItem.UploadProgress
							fillStyle={{ background: "linear-gradient(90deg, #818cf8, #a78bfa)" }}
						/>
						<FileItem.ErrorMessage style={{ color: "#f87171" }} />
					</FileItem>
				))}
			</div>
		</MockFilesProvider>
	);
}
