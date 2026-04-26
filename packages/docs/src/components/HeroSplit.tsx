import type React from "react";

export default function HeroSplit() {
	return (
		<div className="not-content" style={wrapper}>
			<div style={strip}>
				Built and maintained by{" "}
				<a
					href="https://hyperserve.io"
					rel="noopener noreferrer"
					style={stripLink}
					target="_blank"
				>
					Hyperserve
				</a>{" "}
				— video infrastructure for developers
			</div>
			<div style={split}>
				<div style={codePane}>
					<p style={codePaneLabel}>5 lines to get started</p>
					<pre style={pre}>
						<code>
							<span style={kw}>import</span>{" "}
							<span style={punct}>{"{ "}</span>
							<span style={comp}>UploadProvider</span>
							<span style={punct}>{" }"}</span>{" "}
							<span style={kw}>from</span>{" "}
							<span style={str}>{"'@hyperserve/upload'"}</span>
							{"\n"}
							<span style={kw}>import</span>{" "}
							<span style={punct}>{"{ "}</span>
							<span style={comp}>DropZone</span>
							<span style={punct}>{", "}</span>
							<span style={comp}>FileList</span>
							<span style={punct}>{" }"}</span>{" "}
							<span style={kw}>from</span>{" "}
							<span style={str}>{"'@hyperserve/upload-react'"}</span>
							{"\n\n"}
							<span style={kw}>function</span>{" "}
							<span style={fn}>App</span>
							<span style={punct}>{"() {"}</span>
							{"\n  "}
							<span style={kw}>return</span>{" "}
							<span style={punct}>{"("}</span>
							{"\n    "}
							<span style={tag}>{"<"}</span>
							<span style={comp}>UploadProvider</span>{" "}
							<span style={attr}>config</span>
							<span style={punct}>{"={"}</span>
							<span style={id}>config</span>
							<span style={punct}>{"}"}</span>
							<span style={tag}>{">"}</span>
							{"\n      "}
							<span style={tag}>{"<"}</span>
							<span style={comp}>DropZone</span>{" "}
							<span style={tag}>{"/>"}</span>
							{"\n      "}
							<span style={tag}>{"<"}</span>
							<span style={comp}>FileList</span>{" "}
							<span style={tag}>{"/>"}</span>
							{"\n    "}
							<span style={tag}>{"</"}</span>
							<span style={comp}>UploadProvider</span>
							<span style={tag}>{">"}</span>
							{"\n  "}
							<span style={punct}>{")"}</span>
							{"\n"}
							<span style={punct}>{"}"}</span>
						</code>
					</pre>
				</div>
				<div style={previewPane}>
					<p style={previewPaneLabel}>What you get</p>
					<div style={dropZoneMock}>
						<div style={arrow}>⬆</div>
						<p style={dz1}>Drop video files here</p>
						<p style={dz2}>MP4, WebM, MOV — up to 500 MB</p>
					</div>
					<div style={fileListMock}>
						<div style={fileRow}>
							<div style={thumbnail} />
							<div style={fileData}>
								<p style={fileName}>intro.mp4</p>
								<div style={track}>
									<div style={{ ...bar, width: "65%" }} />
								</div>
							</div>
							<span style={{ ...pill, ...pillUploading }}>65%</span>
						</div>
						<div style={fileRow}>
							<div style={thumbnail} />
							<div style={fileData}>
								<p style={fileName}>demo.mov</p>
								<div style={track}>
									<div style={{ ...bar, width: "100%", background: "#22c55e" }} />
								</div>
							</div>
							<span style={{ ...pill, ...pillDone }}>Done ✓</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

const wrapper: React.CSSProperties = {
	border: "1px solid #1e293b",
	borderRadius: 8,
	margin: "1.5rem 0 2rem",
	overflow: "auto",
};

const strip: React.CSSProperties = {
	background: "#0f172a",
	borderBottom: "1px solid #1e293b",
	color: "#64748b",
	fontSize: "0.8rem",
	padding: "0.625rem 1.25rem",
	textAlign: "center",
};

const stripLink: React.CSSProperties = {
	color: "#818cf8",
	textDecoration: "underline",
};

const split: React.CSSProperties = {
	display: "grid",
	gridTemplateColumns: "1fr 1fr",
	minWidth: 520,
};

const codePane: React.CSSProperties = {
	background: "#0f172a",
	borderRight: "1px solid #1e293b",
	overflow: "auto",
	padding: "1.25rem 1.5rem",
};

const codePaneLabel: React.CSSProperties = {
	color: "#475569",
	fontSize: "0.65rem",
	fontWeight: 600,
	letterSpacing: "0.08em",
	margin: "0 0 0.75rem",
	textTransform: "uppercase",
};

const pre: React.CSSProperties = {
	background: "transparent",
	border: "none",
	color: "#94a3b8",
	fontFamily: "monospace",
	fontSize: "0.75rem",
	lineHeight: 1.7,
	margin: 0,
	overflow: "visible",
	padding: 0,
};

const kw: React.CSSProperties = { color: "#818cf8" };
const comp: React.CSSProperties = { color: "#67e8f9" };
const str: React.CSSProperties = { color: "#86efac" };
const fn: React.CSSProperties = { color: "#fde68a" };
const attr: React.CSSProperties = { color: "#fbbf24" };
const id: React.CSSProperties = { color: "#e2e8f0" };
const tag: React.CSSProperties = { color: "#f472b6" };
const punct: React.CSSProperties = { color: "#94a3b8" };

const previewPane: React.CSSProperties = {
	background: "#f8fafc",
	padding: "1.25rem 1.5rem",
};

const previewPaneLabel: React.CSSProperties = {
	color: "#94a3b8",
	fontSize: "0.65rem",
	fontWeight: 600,
	letterSpacing: "0.08em",
	margin: "0 0 0.75rem",
	textTransform: "uppercase",
};

const dropZoneMock: React.CSSProperties = {
	border: "2px dashed #cbd5e1",
	borderRadius: 6,
	color: "#64748b",
	marginBottom: "0.6rem",
	padding: "1rem",
	textAlign: "center",
};

const arrow: React.CSSProperties = {
	fontSize: "1.25rem",
	marginBottom: "0.2rem",
};

const dz1: React.CSSProperties = {
	color: "#475569",
	fontSize: "0.78rem",
	fontWeight: 600,
	margin: "0 0 0.15rem",
};

const dz2: React.CSSProperties = {
	color: "#94a3b8",
	fontSize: "0.7rem",
	margin: 0,
};

const fileListMock: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "0.4rem",
};

const fileRow: React.CSSProperties = {
	alignItems: "center",
	background: "#fff",
	border: "1px solid #e2e8f0",
	borderRadius: 5,
	display: "flex",
	gap: "0.6rem",
	padding: "0.5rem 0.6rem",
};

const thumbnail: React.CSSProperties = {
	background: "#f1f5f9",
	borderRadius: 3,
	flexShrink: 0,
	height: 30,
	width: 30,
};

const fileData: React.CSSProperties = {
	flex: 1,
};

const fileName: React.CSSProperties = {
	color: "#1e293b",
	fontSize: "0.72rem",
	fontWeight: 600,
	margin: "0 0 3px",
};

const track: React.CSSProperties = {
	background: "#e2e8f0",
	borderRadius: 2,
	height: 3,
};

const bar: React.CSSProperties = {
	background: "#6366f1",
	borderRadius: 2,
	height: "100%",
};

const pill: React.CSSProperties = {
	borderRadius: 99,
	fontSize: "0.65rem",
	fontWeight: 600,
	padding: "1px 6px",
};

const pillUploading: React.CSSProperties = {
	background: "#eef2ff",
	color: "#6366f1",
};

const pillDone: React.CSSProperties = {
	background: "#f0fdf4",
	color: "#16a34a",
};
