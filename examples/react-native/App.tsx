import React from "react";
import {
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as DocumentPicker from "expo-document-picker";
import {
	UploadProvider,
	useUpload,
	type FileRef,
	type UploadConfig,
} from "@hyperserve/universal-video-uploader";
import {
	FileItem,
	FileList,
	FilePicker,
	ProgressBar,
	StatusBadge,
} from "@hyperserve/universal-video-uploader-native";

const config: UploadConfig = {
	apiKey: "YOUR_HYPERSERVE_API_KEY",
	baseUrl: "https://api.hyperserve.io/v1",
	uploadOptions: {
		isPublic: true,
		resolutions: "240p,480p",
	},
};

async function pickVideos(): Promise<FileRef[]> {
	const result = await DocumentPicker.getDocumentAsync({
		multiple: true,
		type: "video/*",
	});
	if (result.canceled) return [];
	return result.assets
		.filter((a) => a.mimeType?.startsWith("video/"))
		.map((asset) => ({
			name: asset.name,
			size: asset.size ?? 0,
			type: asset.mimeType ?? "video/mp4",
			uri: asset.uri,
		}));
}

function UploadScreen() {
	const { files } = useUpload();

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar style="dark" />
			<ScrollView contentContainerStyle={styles.scroll}>
				<Text style={styles.title}>Universal Video Uploader</Text>
				<Text style={styles.subtitle}>React Native Example</Text>

				<FilePicker
					pickFiles={pickVideos}
					style={styles.pickButton}
				/>

				{files.length === 0 && (
					<Text style={styles.emptyText}>
						No files selected yet.
					</Text>
				)}

				<View style={styles.list}>
					<FileList emptyMessage="">
						{(file) => (
							<FileItem file={file} key={file.id}>
								<View style={styles.cardHeader}>
									<FileItem.FileName />
									<StatusBadge status={file.status} />
								</View>
								<FileItem.FileSize />
								{file.status === "uploading" && (
									<ProgressBar progress={file.progress} />
								)}
								<FileItem.ErrorMessage />
								<View style={styles.actions}>
									<FileItem.RetryButton />
									<FileItem.RemoveButton />
								</View>
							</FileItem>
						)}
					</FileList>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

class ErrorBoundary extends React.Component<
	{ children: React.ReactNode },
	{ error: Error | null }
> {
	state = { error: null as Error | null };

	static getDerivedStateFromError(error: Error) {
		return { error };
	}

	render() {
		if (this.state.error) {
			return (
				<SafeAreaView style={styles.errorContainer}>
					<Text style={styles.errorTitle}>Something went wrong</Text>
					<Text style={styles.errorDetail}>
						{this.state.error.message}
					</Text>
				</SafeAreaView>
			);
		}
		return this.props.children;
	}
}

export default function App() {
	return (
		<ErrorBoundary>
			<UploadProvider config={config}>
				<UploadScreen />
			</UploadProvider>
		</ErrorBoundary>
	);
}

const styles = StyleSheet.create({
	actions: {
		flexDirection: "row",
		gap: 12,
		marginTop: 4,
	},
	cardHeader: {
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
	},
	container: {
		backgroundColor: "#fff",
		flex: 1,
	},
	emptyText: {
		color: "#94a3b8",
		marginTop: 32,
		textAlign: "center",
	},
	errorContainer: {
		alignItems: "center",
		backgroundColor: "#fff",
		flex: 1,
		justifyContent: "center",
		padding: 24,
	},
	errorDetail: {
		color: "#64748b",
		fontSize: 14,
		textAlign: "center",
	},
	errorTitle: {
		color: "#ef4444",
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 8,
	},
	list: {
		marginTop: 16,
	},
	pickButton: {
		marginBottom: 8,
	},
	scroll: {
		padding: 20,
		paddingTop: 48,
	},
	subtitle: {
		color: "#64748b",
		fontSize: 15,
		marginBottom: 24,
	},
	title: {
		fontSize: 22,
		fontWeight: "700",
		marginBottom: 4,
	},
});
