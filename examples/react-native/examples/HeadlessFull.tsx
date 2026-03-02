import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
	useUpload,
	type ViewMode,
} from "@hyperserve/universal-video-uploader";
import { ProgressBar, StatusBadge } from "@hyperserve/universal-video-uploader-native";
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

export function HeadlessFull() {
	const {
		addFiles,
		clearCompleted,
		files,
		removeFile,
		retryFile,
		setViewMode,
		viewMode,
	} = useUpload();

	const hasCompleted = files.some((f) => f.status === "ready");

	const onPick = async () => {
		const refs = await pickVideos();
		if (refs.length > 0) addFiles(refs);
	};

	return (
		<View>
			<Text style={styles.desc}>
				Headless full demo: validation, retry/error, list-grid, playback.
			</Text>
			<View style={styles.controls}>
				<Pressable onPress={onPick} style={styles.primaryBtn}>
					<Text style={styles.primaryBtnText}>Pick Videos</Text>
				</Pressable>
				<ModeToggle mode={viewMode} setMode={setViewMode} />
				{hasCompleted && (
					<Pressable onPress={clearCompleted} style={styles.secondaryBtn}>
						<Text style={styles.secondaryBtnText}>Clear Completed</Text>
					</Pressable>
				)}
			</View>

			{files.length === 0 && <Text style={styles.empty}>No files selected yet.</Text>}

			<View style={viewMode === "grid" ? styles.grid : styles.list}>
				{files.map((file) => (
					<View key={file.id} style={[styles.card, viewMode === "grid" && styles.gridCard]}>
						<View style={styles.cardHeader}>
							<Text numberOfLines={1} style={styles.fileName}>
								{file.ref.name}
							</Text>
							<StatusBadge status={file.status} />
						</View>
						<Text style={styles.meta}>{(file.ref.size / (1024 * 1024)).toFixed(1)} MB</Text>
						{file.status === "uploading" && <ProgressBar progress={file.progress} />}
						{file.status === "processing" && (
							<Text style={styles.processing}>Processing on server...</Text>
						)}
						{file.error && <Text style={styles.error}>{file.error}</Text>}
						<Playback file={file} />
						<View style={styles.actions}>
							{file.status === "failed" && (
								<Pressable onPress={() => retryFile(file.id)}>
									<Text style={styles.retry}>Retry</Text>
								</Pressable>
							)}
							<Pressable onPress={() => removeFile(file.id)}>
								<Text style={styles.remove}>Remove</Text>
							</Pressable>
						</View>
					</View>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	actions: { flexDirection: "row", gap: 12, marginTop: 6 },
	card: { backgroundColor: "#f8fafc", borderColor: "#e2e8f0", borderRadius: 10, borderWidth: 1, gap: 6, padding: 14 },
	cardHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 8 },
	controls: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
	desc: { color: "#64748b", fontSize: 13, marginBottom: 10 },
	empty: { color: "#94a3b8", textAlign: "center", marginTop: 8 },
	error: { color: "#ef4444", fontSize: 13 },
	fileName: { flex: 1, fontWeight: "500" },
	grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
	gridCard: { width: "48%" },
	list: { gap: 10 },
	meta: { color: "#94a3b8", fontSize: 12 },
	primaryBtn: { alignItems: "center", backgroundColor: "#3b82f6", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12 },
	primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
	processing: { color: "#f59e0b", fontSize: 12 },
	remove: { color: "#ef4444", fontSize: 13 },
	retry: { color: "#3b82f6", fontSize: 13 },
	secondaryBtn: { backgroundColor: "#f1f5f9", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12 },
	secondaryBtnText: { color: "#334155", fontSize: 14, fontWeight: "600" },
	toggleActive: { backgroundColor: "#3b82f6" },
	toggleButton: { paddingHorizontal: 10, paddingVertical: 8 },
	toggleGroup: { borderColor: "#e2e8f0", borderRadius: 8, borderWidth: 1, flexDirection: "row", overflow: "hidden" },
	toggleText: { color: "#64748b", fontSize: 13, fontWeight: "500" },
	toggleTextActive: { color: "#fff" },
});
