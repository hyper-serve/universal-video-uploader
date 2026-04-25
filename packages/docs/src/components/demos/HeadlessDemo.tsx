import { toFileRefs, UploadProvider, useUpload } from "@hyperserve/upload";
import type React from "react";
import { useMemo, useRef, useState } from "react";
import { createMockConfig } from "./MockAdapter";

function formatSize(bytes: number): string {
	const mb = bytes / (1024 * 1024);
	return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`;
}

function UploadUI() {
	const { addFiles, files, removeFile, retryFile } = useUpload();
	const inputRef = useRef<HTMLInputElement>(null);
	const [drag, setDrag] = useState(false);

	const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			addFiles(toFileRefs(e.target.files));
			e.target.value = "";
		}
	};

	const onDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDrag(false);
		const list = Array.from(e.dataTransfer.files).filter((f) =>
			f.type.startsWith("video/"),
		);
		if (list.length) addFiles(toFileRefs(list));
	};

	return (
		<div style={layout}>
			<input
				accept="video/*"
				multiple
				onChange={onInputChange}
				ref={inputRef}
				style={{ display: "none" }}
				type="file"
			/>

			{/* biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop drop zone on section is intentional */}
			<section
				onDragLeave={() => setDrag(false)}
				onDragOver={(e) => {
					e.preventDefault();
					setDrag(true);
				}}
				onDrop={onDrop}
				style={{
					...dropArea,
					...(drag ? dropAreaActive : {}),
				}}
			>
				<span style={dropText}>
					{drag ? "Drop to add" : "Drag videos here or "}
				</span>
				<button
					onClick={() => inputRef.current?.click()}
					style={primaryBtn}
					type="button"
				>
					browse
				</button>
			</section>

			{files.length === 0 ? (
				<p style={empty}>No files — this demo uses zero UI components.</p>
			) : (
				<ul style={list}>
					{files.map((file) => (
						<li key={file.id} style={row}>
							<div style={rowMain}>
								<span style={fileName}>{file.ref.name}</span>
								<span style={meta}>
									{formatSize(file.ref.size)} · {file.status}
								</span>
							</div>
							{file.status === "uploading" && (
								<div style={track}>
									<div style={{ ...fill, width: `${file.progress}%` }} />
								</div>
							)}
							{file.status === "processing" && file.statusDetail && (
								<span style={warn}>{file.statusDetail}</span>
							)}
							{file.error && <span style={err}>{file.error}</span>}
							<div style={rowActions}>
								{file.status === "failed" && (
									<button
										onClick={() => retryFile(file.id)}
										style={textBtn}
										type="button"
									>
										Retry
									</button>
								)}
								{file.status !== "processing" && file.status !== "ready" && (
									<button
										onClick={() => removeFile(file.id)}
										style={{ ...textBtn, color: "#b91c1c" }}
										type="button"
									>
										Remove
									</button>
								)}
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export default function HeadlessDemo() {
	const config = useMemo(() => createMockConfig(), []);

	return (
		<div style={container}>
			<UploadProvider config={config}>
				<UploadUI />
			</UploadProvider>
		</div>
	);
}

const container: React.CSSProperties = {
	background: "#fff",
	border: "1px solid #e2e8f0",
	borderRadius: 8,
	padding: "1.5rem",
};

const layout: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "1rem",
};

const dropArea: React.CSSProperties = {
	alignItems: "center",
	background: "#f8fafc",
	border: "1px dashed #cbd5e1",
	borderRadius: 8,
	display: "flex",
	flexWrap: "wrap",
	gap: "0.5rem",
	justifyContent: "center",
	minHeight: 80,
	padding: "1rem",
	transition: "background 0.15s, border-color 0.15s",
};

const dropAreaActive: React.CSSProperties = {
	background: "#ecfdf5",
	borderColor: "#10b981",
};

const dropText: React.CSSProperties = {
	color: "#64748b",
	fontSize: "0.875rem",
};

const primaryBtn: React.CSSProperties = {
	background: "#0f766e",
	border: "none",
	borderRadius: 6,
	color: "#fff",
	cursor: "pointer",
	fontSize: "0.8125rem",
	padding: "0.35rem 0.75rem",
};

const empty: React.CSSProperties = {
	color: "#94a3b8",
	fontSize: "0.875rem",
	margin: 0,
};

const list: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "0.75rem",
	listStyle: "none",
	margin: 0,
	padding: 0,
};

const row: React.CSSProperties = {
	background: "#fff",
	border: "1px solid #e2e8f0",
	borderRadius: 6,
	display: "flex",
	flexDirection: "column",
	gap: "0.5rem",
	padding: "0.75rem 1rem",
};

const rowMain: React.CSSProperties = {
	alignItems: "baseline",
	display: "flex",
	gap: "0.5rem",
	justifyContent: "space-between",
};

const fileName: React.CSSProperties = {
	fontSize: "0.875rem",
	fontWeight: 500,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
};

const meta: React.CSSProperties = { color: "#94a3b8", fontSize: "0.75rem" };
const track: React.CSSProperties = {
	background: "#e2e8f0",
	borderRadius: 4,
	height: 4,
	overflow: "hidden",
};
const fill: React.CSSProperties = {
	background: "#0f766e",
	height: "100%",
	transition: "width 0.2s",
};
const warn: React.CSSProperties = { color: "#b45309", fontSize: "0.8125rem" };
const err: React.CSSProperties = { color: "#b91c1c", fontSize: "0.8125rem" };

const rowActions: React.CSSProperties = {
	display: "flex",
	gap: "0.5rem",
};

const textBtn: React.CSSProperties = {
	background: "none",
	border: "none",
	color: "#0f766e",
	cursor: "pointer",
	fontSize: "0.75rem",
	padding: 0,
};
