import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useUpload } from "@hyper-serve/upload";
import type { ViewMode } from "@hyper-serve/upload-react-native";
import { ProgressBar } from "@hyper-serve/upload-react-native";
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

function formatSize(bytes: number): string {
	const mb = bytes / (1024 * 1024);
	return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`;
}

export function HeadlessFull() {
	const {
		addFiles,
		files,
		removeFile,
		retryFile,
	} = useUpload();
	const [viewMode, setViewMode] = React.useState<ViewMode>("list");

	const onPick = async () => {
		const refs = await pickVideos();
		if (refs.length > 0) addFiles(refs);
	};

	return (
		<View style={styles.layout}>
			<View style={styles.header}>
				<Text style={styles.title}>Uploads</Text>
				<Text style={styles.subtitle}>
					Core only — no UI components. Custom layout and behavior.
				</Text>
			</View>

			<View style={styles.controls}>
				<Pressable onPress={onPick} style={styles.primaryBtn}>
					<Text style={styles.primaryBtnText}>Pick videos</Text>
				</Pressable>
				<ModeToggle mode={viewMode} setMode={setViewMode} />
			</View>

			{files.length === 0 ? (
				<Text style={styles.empty}>No files. Add videos above.</Text>
			) : (
				<View style={viewMode === "grid" ? styles.grid : styles.list}>
					{files.map((file) => (
						<View
							key={file.id}
							style={[styles.card, viewMode === "grid" && styles.gridCard]}
						>
							<View style={styles.cardHeader}>
								<Text numberOfLines={1} style={styles.fileName}>
									{file.ref.name}
								</Text>
								<Text style={styles.meta}>
									{formatSize(file.ref.size)} · {file.status}
								</Text>
							</View>
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
							{file.error && <Text style={styles.error}>{file.error}</Text>}
							<Playback file={file} />
							<View style={styles.actions}>
								{file.status === "failed" && (
									<Pressable onPress={() => retryFile(file.id)}>
										<Text style={styles.retry}>Retry</Text>
									</Pressable>
								)}
								{file.status !== "processing" && file.status !== "ready" && (
									<Pressable onPress={() => removeFile(file.id)}>
										<Text style={styles.remove}>Remove</Text>
									</Pressable>
								)}
							</View>
						</View>
					))}
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	actions: {
		flexDirection: "row",
		gap: 12,
		marginTop: 6,
	},
	card: {
		backgroundColor: "#fff",
		borderColor: "#e2e8f0",
		borderRadius: 6,
		borderWidth: 1,
		gap: 6,
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	cardHeader: {
		alignItems: "baseline",
		flexDirection: "row",
		gap: 8,
		justifyContent: "space-between",
	},
	controls: {
		alignItems: "center",
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
		marginBottom: 12,
	},
	empty: {
		color: "#94a3b8",
		fontSize: 14,
		marginTop: 4,
		textAlign: "left",
	},
	error: {
		color: "#b91c1c",
		fontSize: 13,
	},
	fileName: {
		flex: 1,
		fontSize: 14,
		fontWeight: "500",
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
	},
	gridCard: {
		width: "48%",
	},
	layout: {
		gap: 16,
		maxWidth: 560,
		width: "100%",
	},
	list: {
		gap: 10,
	},
	meta: {
		color: "#94a3b8",
		fontSize: 12,
	},
	primaryBtn: {
		alignItems: "center",
		backgroundColor: "#0f766e",
		borderRadius: 6,
		paddingHorizontal: 14,
		paddingVertical: 10,
	},
	primaryBtnText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600",
	},
	processing: {
		color: "#b45309",
		fontSize: 13,
	},
	progressFill: {
		backgroundColor: "#0f766e",
	},
	progressTrack: {
		backgroundColor: "#e2e8f0",
	},
	remove: {
		color: "#b91c1c",
		fontSize: 13,
	},
	retry: {
		color: "#0f766e",
		fontSize: 13,
	},
	header: {
		borderBottomColor: "#e2e8f0",
		borderBottomWidth: 1,
		paddingBottom: 8,
	},
	title: {
		fontSize: 18,
		fontWeight: "600",
	},
	subtitle: {
		color: "#64748b",
		fontSize: 13,
		marginTop: 4,
	},
	toggleActive: {
		backgroundColor: "#3b82f6",
	},
	toggleButton: {
		paddingHorizontal: 10,
		paddingVertical: 8,
	},
	toggleGroup: {
		borderColor: "#e2e8f0",
		borderRadius: 8,
		borderWidth: 1,
		flexDirection: "row",
		overflow: "hidden",
	},
	toggleText: {
		color: "#64748b",
		fontSize: 13,
		fontWeight: "500",
	},
	toggleTextActive: {
		color: "#fff",
	},
});
