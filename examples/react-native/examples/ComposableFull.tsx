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
		<View>
			<Text style={styles.desc}>
				Composable (Base) — native components with default props only.
			</Text>
			<View style={styles.controls}>
				<FilePicker pickFiles={pickVideos} />
				<ModeToggle mode={viewMode} setMode={setViewMode} />
				{hasCompleted && (
					<Pressable onPress={clearCompleted} style={styles.secondaryBtn}>
						<Text style={styles.secondaryBtnText}>Clear completed</Text>
					</Pressable>
				)}
			</View>
			<FileList emptyMessage="No files selected yet." mode={viewMode} columns={2}>
				{(file) => (
					<FileItem file={file} key={file.id} style={viewMode === "grid" ? styles.gridCard : undefined}>
						{viewMode === "grid" && <Thumbnail file={file} />}
						<View style={styles.cardHeader}>
							<FileItem.FileName />
							<StatusBadge status={file.status} />
						</View>
						<FileItem.FileSize />
						{file.status === "uploading" && <ProgressBar progress={file.progress} />}
						{file.status === "processing" && (
							<Text style={styles.processing}>Processing on server...</Text>
						)}
						<FileItem.ErrorMessage />
						<Playback file={file} />
						<View style={styles.actions}>
							<FileItem.RetryButton />
							<FileItem.RemoveButton />
						</View>
					</FileItem>
				)}
			</FileList>
		</View>
	);
}

const styles = StyleSheet.create({
	actions: { flexDirection: "row", gap: 12, marginTop: 6 },
	cardHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 8 },
	controls: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
	desc: { color: "#64748b", fontSize: 13, marginBottom: 10 },
	gridCard: { height: "100%" },
	processing: { color: "#f59e0b", fontSize: 12 },
	secondaryBtn: { backgroundColor: "#f1f5f9", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12 },
	secondaryBtnText: { color: "#334155", fontSize: 14, fontWeight: "600" },
	toggleActive: { backgroundColor: "#3b82f6" },
	toggleButton: { paddingHorizontal: 10, paddingVertical: 8 },
	toggleGroup: { borderColor: "#e2e8f0", borderRadius: 8, borderWidth: 1, flexDirection: "row", overflow: "hidden" },
	toggleText: { color: "#64748b", fontSize: 13, fontWeight: "500" },
	toggleTextActive: { color: "#fff" },
});
