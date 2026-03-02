import React, { useRef } from "react";
import {
	UploadProvider,
	toFileRefs,
	useUpload,
	type UploadConfig,
} from "@hyperserve/universal-video-uploader";
import {
	FileItem,
	FileList,
	ProgressBar,
	StatusBadge,
	Thumbnail,
} from "@hyperserve/universal-video-uploader-react";
import { CONFIG } from "../shared";

const config: UploadConfig = {
	...CONFIG,
	uploadOptions: {
		isPublic: true,
		resolutions: "240p,480p,720p",
	},
};

function UploadUI() {
	const { addFiles, viewMode, setViewMode } = useUpload();
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			addFiles(toFileRefs(e.target.files));
			e.target.value = "";
		}
	};

	return (
		<div>
			<p style={{ color: "#64748b", marginBottom: "1rem" }}>
				Toggle between list and grid views. Same data, different layout.
			</p>

			<div
				style={{
					alignItems: "center",
					display: "flex",
					gap: "1rem",
					marginBottom: "1.5rem",
				}}
			>
				<input
					accept="video/*"
					multiple
					onChange={handleFileChange}
					ref={inputRef}
					style={{ display: "none" }}
					type="file"
				/>
				<button
					onClick={() => inputRef.current?.click()}
					style={btnStyle}
					type="button"
				>
					Add Videos
				</button>

				<div style={toggleGroupStyle}>
					<button
						onClick={() => setViewMode("list")}
						style={{
							...toggleBtnStyle,
							...(viewMode === "list" ? toggleActiveStyle : {}),
						}}
						type="button"
					>
						&#9776; List
					</button>
					<button
						onClick={() => setViewMode("grid")}
						style={{
							...toggleBtnStyle,
							...(viewMode === "grid" ? toggleActiveStyle : {}),
						}}
						type="button"
					>
						&#9638; Grid
					</button>
				</div>
			</div>

			<FileList>
				{(file) => (
					<FileItem file={file} key={file.id}>
						{viewMode === "list" ? (
							<div
								style={{
									alignItems: "center",
									display: "flex",
									gap: "0.75rem",
								}}
							>
								<Thumbnail
									file={file}
									style={{
										borderRadius: 4,
										height: 48,
										width: 64,
									}}
								/>
								<div style={{ flex: 1, minWidth: 0 }}>
									<FileItem.FileName />
									{file.status === "uploading" && (
										<ProgressBar
											progress={file.progress}
										/>
									)}
								</div>
								<StatusBadge status={file.status} />
								<FileItem.RetryButton />
								<FileItem.RemoveButton>
									&#10005;
								</FileItem.RemoveButton>
							</div>
						) : (
							<>
								<Thumbnail file={file} />
								<FileItem.FileName
									style={{ fontSize: "0.8rem" }}
								/>
								<StatusBadge status={file.status} />
								{file.status === "uploading" && (
									<ProgressBar progress={file.progress} />
								)}
							</>
						)}
					</FileItem>
				)}
			</FileList>
		</div>
	);
}

export function ListAndGridViews() {
	return (
		<UploadProvider config={config}>
			<UploadUI />
		</UploadProvider>
	);
}

const btnStyle: React.CSSProperties = {
	background: "#3b82f6",
	border: "none",
	borderRadius: 6,
	color: "#fff",
	cursor: "pointer",
	fontSize: "0.9rem",
	padding: "0.6rem 1.2rem",
};

const toggleGroupStyle: React.CSSProperties = {
	border: "1px solid #e2e8f0",
	borderRadius: 6,
	display: "flex",
	overflow: "hidden",
};

const toggleBtnStyle: React.CSSProperties = {
	background: "#fff",
	border: "none",
	cursor: "pointer",
	fontSize: "0.85rem",
	padding: "0.5rem 0.75rem",
};

const toggleActiveStyle: React.CSSProperties = {
	background: "#3b82f6",
	color: "#fff",
};
