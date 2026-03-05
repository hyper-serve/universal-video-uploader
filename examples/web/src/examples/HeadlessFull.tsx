import React, { useRef, useState } from "react";
import {
	UploadProvider,
	allowedTypes,
	composeValidators,
	createHyperserveConfig,
	maxDuration,
	maxFileSize,
	toFileRefs,
	useUpload,
} from "@hyperserve/universal-video-uploader";
import { HYPERSERVE_API_KEY, HYPERSERVE_BASE_URL } from "../shared";

const validate = composeValidators(
	maxFileSize(500 * 1024 * 1024),
	allowedTypes(["video/*"]),
	maxDuration(120),
);

const config = createHyperserveConfig({
	apiKey: HYPERSERVE_API_KEY,
	baseUrl: HYPERSERVE_BASE_URL,
	uploadOptions: {
		isPublic: true,
		resolutions: "240p,480p,720p",
	},
	validate,
});

function formatSize(bytes: number): string {
	const mb = bytes / (1024 * 1024);
	return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`;
}

function UploadUI() {
	const { addFiles, clearCompleted, files, removeFile, retryFile } = useUpload();
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

	const hasDone = files.some((f) => f.status === "ready");

	return (
		<div style={layout}>
			<header style={header}>
				<h2 style={title}>Uploads</h2>
				<p style={subtitle}>
					Core only — no UI components. Custom layout and behavior.
				</p>
			</header>

			<input
				accept="video/*"
				multiple
				onChange={onInputChange}
				ref={inputRef}
				style={{ display: "none" }}
				type="file"
			/>

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
				<span style={dropIcon}>↑</span>
				<span style={dropText}>
					{drag ? "Drop to add" : "Drag videos here or"}
				</span>
				<button
					onClick={() => inputRef.current?.click()}
					style={primaryBtn}
					type="button"
				>
					browse
				</button>
			</section>

			{hasDone && (
				<div style={toolbar}>
					<button onClick={clearCompleted} style={ghostBtn} type="button">
						Clear completed
					</button>
				</div>
			)}

			{files.length === 0 ? (
				<p style={empty}>No files. Add videos above.</p>
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
							{file.status === "processing" && (
								<span style={warn}>Processing…</span>
							)}
							{file.error && <span style={err}>{file.error}</span>}
							{file.status === "ready" && file.playbackUrl && (
								<video
									controls
									src={file.playbackUrl}
									style={video}
								>
									<track kind="captions" />
								</video>
							)}
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

export function HeadlessFull() {
	return (
		<UploadProvider config={config}>
			<UploadUI />
		</UploadProvider>
	);
}

const layout: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "1.25rem",
	maxWidth: 560,
};

const header: React.CSSProperties = {
	borderBottom: "1px solid #e2e8f0",
	paddingBottom: "0.75rem",
};

const title: React.CSSProperties = {
	fontSize: "1.125rem",
	fontWeight: 600,
	margin: 0,
};

const subtitle: React.CSSProperties = {
	color: "#64748b",
	fontSize: "0.8125rem",
	margin: "0.25rem 0 0",
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
	minHeight: 100,
	padding: "1rem",
	transition: "background 0.15s, border-color 0.15s",
};

const dropAreaActive: React.CSSProperties = {
	background: "#ecfdf5",
	borderColor: "#10b981",
};

const dropIcon: React.CSSProperties = {
	color: "#94a3b8",
	fontSize: "1.25rem",
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

const ghostBtn: React.CSSProperties = {
	background: "none",
	border: "none",
	color: "#64748b",
	cursor: "pointer",
	fontSize: "0.8125rem",
	padding: "0.25rem 0",
};

const toolbar: React.CSSProperties = {
	display: "flex",
	justifyContent: "flex-start",
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
	display: "flex",
	justifyContent: "space-between",
	alignItems: "baseline",
	gap: "0.5rem",
};

const fileName: React.CSSProperties = {
	fontSize: "0.875rem",
	fontWeight: 500,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
};

const meta: React.CSSProperties = {
	color: "#94a3b8",
	fontSize: "0.75rem",
};

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

const warn: React.CSSProperties = {
	color: "#b45309",
	fontSize: "0.8125rem",
};

const err: React.CSSProperties = {
	color: "#b91c1c",
	fontSize: "0.8125rem",
};

const video: React.CSSProperties = {
	borderRadius: 6,
	maxHeight: 200,
	width: "100%",
};

const rowActions: React.CSSProperties = {
	display: "flex",
	gap: "0.5rem",
	marginTop: "0.25rem",
};

const textBtn: React.CSSProperties = {
	background: "none",
	border: "none",
	color: "#0f766e",
	cursor: "pointer",
	fontSize: "0.75rem",
	padding: 0,
};
