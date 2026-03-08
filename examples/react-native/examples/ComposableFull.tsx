import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useUpload, type ViewMode } from "@hyperserve/universal-video-uploader";
import {
	FileItem,
	FileList,
	FilePicker,
	ProgressBar,
	StatusBadge,
	Thumbnail,
} from "@hyperserve/universal-video-uploader-native";
import { Playback, pickVideos } from "./shared";

const ACCENT = "#5589F1";

function ModeToggle({
	mode,
	setMode,
}: {
	mode: ViewMode;
	setMode: (mode: ViewMode) => void;
}) {
	return (
		<View style={styles.toggleGroup}>
			<Pressable
				onPress={() => setMode("list")}
				style={[styles.toggleButton, mode === "list" && styles.toggleActive]}
			>
				<Text style={[styles.toggleText, mode === "list" && styles.toggleTextActive]}>
					List
				</Text>
			</Pressable>
			<Pressable
				onPress={() => setMode("grid")}
				style={[styles.toggleButton, mode === "grid" && styles.toggleActive]}
			>
				<Text style={[styles.toggleText, mode === "grid" && styles.toggleTextActive]}>
					Grid
				</Text>
			</Pressable>
		</View>
	);
}

export function ComposableBase() {
	const { clearCompleted, files, setViewMode, viewMode } = useUpload();
	const hasCompleted = files.some((f) => f.status === "ready");

	return (
		<View style={styles.wrap}>
			<View style={styles.controls}>
				<FilePicker pickFiles={pickVideos} />
				<Text style={styles.fileCount}>
					{files.length} file{files.length !== 1 ? "s" : ""} added
				</Text>
				<ModeToggle mode={viewMode} setMode={setViewMode} />
				{hasCompleted && (
					<Pressable onPress={clearCompleted} style={styles.clearBtn}>
						<Text style={styles.clearBtnText}>Clear completed</Text>
					</Pressable>
				)}
			</View>
			<FileList emptyMessage="No files selected yet." mode={viewMode} columns={2}>
				{(file) => (
					<FileItem
						file={file}
						key={file.id}
						layout={viewMode === "list" ? "row" : "column"}
						style={viewMode === "grid" ? styles.gridCard : undefined}
					>
						<Thumbnail
							file={file}
							style={viewMode === "list" ? styles.thumbnailList : undefined}
							placeholderStyle={viewMode === "list" ? styles.thumbnailList : undefined}
						/>
						{viewMode === "list" ? (
							<>
								<View style={styles.listMiddle}>
									<FileItem.FileName />
									<FileItem.FileSize />
									{file.status === "uploading" && (
										<View style={styles.progressWrap}>
											<ProgressBar progress={file.progress} />
										</View>
									)}
									{file.status === "processing" && (
										<Text style={styles.processing}>Processing on server…</Text>
									)}
									{file.status === "ready" && file.playbackUrl && (
										<Playback file={file} />
									)}
									<FileItem.ErrorMessage />
								</View>
								<View style={styles.actions}>
									<StatusBadge status={file.status} />
									<FileItem.RetryButton />
									<FileItem.RemoveButton />
								</View>
							</>
						) : (
							<>
								<View style={styles.cardHeader}>
									<FileItem.FileName />
									<StatusBadge status={file.status} />
								</View>
								<FileItem.FileSize />
								{file.status === "uploading" && <ProgressBar progress={file.progress} />}
								{file.status === "processing" && (
									<Text style={styles.processing}>Processing on server…</Text>
								)}
								<FileItem.ErrorMessage />
								<Playback file={file} />
								<View style={styles.actions}>
									<FileItem.RetryButton />
									<FileItem.RemoveButton />
								</View>
							</>
						)}
					</FileItem>
				)}
			</FileList>
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { gap: 12 },
	controls: {
		alignItems: "center",
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
	},
	fileCount: { color: "#374151", fontSize: 14 },
	toggleGroup: {
		borderColor: "#e5e7eb",
		borderRadius: 8,
		borderWidth: 1,
		flexDirection: "row",
		overflow: "hidden",
	},
	toggleButton: { paddingHorizontal: 10, paddingVertical: 8 },
	toggleActive: { backgroundColor: "#f3f4f6" },
	toggleText: { color: "#9ca3af", fontSize: 13, fontWeight: "500" },
	toggleTextActive: { color: "#374151" },
	clearBtn: { marginLeft: "auto" },
	clearBtnText: { color: ACCENT, fontSize: 14 },
	gridCard: { height: "100%" },
	listMiddle: {
		flex: 1,
		minWidth: 0,
		gap: 4,
	},
	thumbnailList: { height: 56, width: 96 },
	progressWrap: { marginTop: 2 },
	cardHeader: {
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
		gap: 8,
	},
	actions: { flexDirection: "row", alignItems: "center", gap: 8 },
	processing: { color: "#d97706", fontSize: 12 },
});
