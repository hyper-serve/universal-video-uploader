import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
	FileItem,
	FileList,
	FilePicker,
	ProgressBar,
	StatusBadge,
	Thumbnail,
	ViewModeProvider,
	useViewMode,
	type ViewMode,
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

function CustomUI() {
	const { viewMode, setViewMode } = useViewMode();

	return (
		<View style={styles.theme}>
			<Text style={styles.desc}>
				Custom — same components, full styling and slot overrides.
			</Text>

			<View style={styles.controls}>
				<FilePicker pickFiles={pickVideos}>
					{({ pick }) => (
						<Pressable onPress={pick} style={styles.primaryBtn}>
							<Text style={styles.primaryBtnText}>Browse videos</Text>
						</Pressable>
					)}
				</FilePicker>
				<ModeToggle mode={viewMode} setMode={setViewMode} />
			</View>

			<FileList
				mode={viewMode}
				columns={2}
				style={styles.list}
				emptyMessage={
					<View style={styles.emptyBlock}>
						<Text style={styles.emptyIcon}>📁</Text>
						<Text style={styles.emptyTitle}>No videos yet</Text>
						<Text style={styles.emptyHint}>
							Use the controls above to add videos. They will appear here.
						</Text>
					</View>
				}
			>
				{(file) => (
					<FileItem
						file={file}
						key={file.id}
						style={[styles.card, viewMode === "grid" && styles.gridCard]}
					>
						{viewMode === "grid" && (
							<Thumbnail
								file={file}
								style={styles.thumb}
								placeholderStyle={styles.thumbPlaceholder}
							/>
						)}
						<View style={styles.cardHeader}>
							<FileItem.FileName style={styles.fileName} />
							<StatusBadge
								status={file.status}
								style={styles.badge}
								textStyle={styles.badgeText}
							/>
						</View>
						<FileItem.FileSize style={styles.fileSize} />
						{file.status === "uploading" && (
							<ProgressBar
								progress={file.progress}
								trackStyle={styles.progressTrack}
								fillStyle={styles.progressFill}
							/>
						)}
						{file.status === "processing" && (
							<Text style={styles.processing}>Processing…</Text>
						)}
						<FileItem.ErrorMessage style={styles.error} />
						{file.status === "ready" && <Playback file={file} />}
						<View style={styles.actions}>
							<FileItem.RetryButton textStyle={styles.retryText} />
							<FileItem.RemoveButton textStyle={styles.removeText} />
						</View>
					</FileItem>
				)}
			</FileList>
		</View>
	);
}

export function Custom() {
	return (
		<ViewModeProvider>
			<CustomUI />
		</ViewModeProvider>
	);
}

const styles = StyleSheet.create({
	actions: {
		flexDirection: "row",
		gap: 12,
		marginTop: 8,
	},
	error: {
		color: "#fca5a5",
		fontSize: 12,
	},
	badge: {
		backgroundColor: "#1e293b",
		borderRadius: 999,
		paddingHorizontal: 8,
		paddingVertical: 2,
	},
	badgeText: {
		color: "#e5e7eb",
		fontSize: 11,
		fontWeight: "600",
		textTransform: "uppercase",
	},
	card: {
		backgroundColor: "#020617",
		borderColor: "#1e293b",
		borderRadius: 10,
		borderWidth: 1,
		gap: 8,
		padding: 12,
	},
	cardHeader: {
		alignItems: "center",
		flexDirection: "row",
		gap: 8,
		justifyContent: "space-between",
	},
	desc: {
		color: "#9ca3af",
		fontSize: 13,
		marginBottom: 12,
	},
	emptyBlock: {
		alignItems: "center",
		gap: 6,
		paddingVertical: 24,
	},
	emptyHint: {
		color: "#6b7280",
		fontSize: 12,
		textAlign: "center",
	},
	emptyIcon: {
		fontSize: 30,
	},
	emptyTitle: {
		color: "#e5e7eb",
		fontSize: 14,
		fontWeight: "600",
	},
	fileName: {
		color: "#f9fafb",
		flex: 1,
		fontWeight: "500",
	},
	fileSize: {
		color: "#6b7280",
		fontSize: 12,
	},
	gridCard: {
		height: "100%",
	},
	list: {
		gap: 10,
		marginTop: 4,
	},
	primaryBtn: {
		alignItems: "center",
		backgroundColor: "#38bdf8",
		borderRadius: 999,
		paddingHorizontal: 18,
		paddingVertical: 10,
	},
	primaryBtnText: {
		color: "#0f172a",
		fontSize: 14,
		fontWeight: "600",
	},
	progressFill: {
		backgroundColor: "#38bdf8",
	},
	progressTrack: {
		backgroundColor: "#1e293b",
	},
	processing: {
		color: "#facc15",
		fontSize: 12,
	},
	removeText: {
		color: "#fca5a5",
		fontSize: 13,
	},
	retryText: {
		color: "#38bdf8",
		fontSize: 13,
	},
	theme: {
		backgroundColor: "#020617",
		borderColor: "#1e293b",
		borderRadius: 16,
		borderWidth: 1,
		padding: 16,
	},
	toggleActive: {
		backgroundColor: "#0f172a",
	},
	toggleButton: {
		paddingHorizontal: 10,
		paddingVertical: 6,
	},
	toggleGroup: {
		borderColor: "#1e293b",
		borderRadius: 999,
		borderWidth: 1,
		flexDirection: "row",
		overflow: "hidden",
	},
	toggleText: {
		color: "#9ca3af",
		fontSize: 12,
		fontWeight: "500",
	},
	toggleTextActive: {
		color: "#e5e7eb",
	},
	thumb: {
		borderRadius: 8,
		height: 110,
	},
	thumbPlaceholder: {
		backgroundColor: "#020617",
		borderColor: "#1e293b",
		borderRadius: 8,
		borderWidth: 1,
	},
	controls: {
		alignItems: "center",
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
		marginBottom: 12,
	},
});

