import React from "react";
import {
    ActivityIndicator,
    Pressable,
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
    type FileState,
    type FileStatus,
    type UploadConfig,
} from "@hyperserve/universal-video-uploader";

const config: UploadConfig = {
    apiKey: "YOUR_HYPERSERVE_API_KEY",
    baseUrl: "https://api.hyperserve.io/v1",
    uploadOptions: {
        isPublic: true,
        resolutions: "240p,480p",
    },
};

function toFileRefs(
    results: DocumentPicker.DocumentPickerResult,
): FileRef[] {
    if (results.canceled) return [];
    return results.assets
        .filter((a) => a.mimeType?.startsWith("video/"))
        .map((asset) => ({
            name: asset.name,
            size: asset.size ?? 0,
            type: asset.mimeType ?? "video/mp4",
            uri: asset.uri,
        }));
}

const statusColors: Record<FileStatus, string> = {
    failed: "#ef4444",
    processing: "#f59e0b",
    ready: "#22c55e",
    selected: "#94a3b8",
    uploading: "#3b82f6",
    validating: "#8b5cf6",
};

function FileCard({
    file,
    onRemove,
    onRetry,
}: {
    file: FileState;
    onRemove: () => void;
    onRetry: () => void;
}) {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.fileName} numberOfLines={1}>
                    {file.ref.name}
                </Text>
                <View
                    style={[
                        styles.badge,
                        { backgroundColor: statusColors[file.status] + "20" },
                    ]}
                >
                    <Text
                        style={[
                            styles.badgeText,
                            { color: statusColors[file.status] },
                        ]}
                    >
                        {file.status}
                    </Text>
                </View>
            </View>

            <Text style={styles.fileSize}>
                {(file.ref.size / (1024 * 1024)).toFixed(1)} MB
            </Text>

            {file.status === "uploading" && (
                <View style={styles.progressTrack}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${file.progress}%` },
                        ]}
                    />
                </View>
            )}

            {file.status === "processing" && (
                <View style={styles.processingRow}>
                    <ActivityIndicator size="small" color="#f59e0b" />
                    <Text style={styles.processingText}>Processing...</Text>
                </View>
            )}

            {file.error && <Text style={styles.errorText}>{file.error}</Text>}

            <View style={styles.actions}>
                {file.status === "failed" && (
                    <Pressable onPress={onRetry} style={styles.retryBtn}>
                        <Text style={styles.retryText}>Retry</Text>
                    </Pressable>
                )}
                <Pressable onPress={onRemove} style={styles.removeBtn}>
                    <Text style={styles.removeText}>Remove</Text>
                </Pressable>
            </View>
        </View>
    );
}

function UploadScreen() {
    const { files, addFiles, removeFile, retryFile } = useUpload();

    const pickFiles = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            multiple: true,
            type: "video/*",
        });
        const refs = toFileRefs(result);
        if (refs.length > 0) {
            addFiles(refs);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.title}>Universal Video Uploader</Text>
                <Text style={styles.subtitle}>React Native Example</Text>

                <Pressable onPress={pickFiles} style={styles.pickButton}>
                    <Text style={styles.pickButtonText}>Pick Videos</Text>
                </Pressable>

                {files.length === 0 && (
                    <Text style={styles.emptyText}>
                        No files selected yet.
                    </Text>
                )}

                {files.map((file) => (
                    <FileCard
                        file={file}
                        key={file.id}
                        onRemove={() => removeFile(file.id)}
                        onRetry={() => retryFile(file.id)}
                    />
                ))}
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
                    <Pressable
                        onPress={() => this.setState({ error: null })}
                        style={styles.retryBtn}
                    >
                        <Text style={styles.retryText}>Try Again</Text>
                    </Pressable>
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
    badge: {
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "600",
    },
    card: {
        backgroundColor: "#f8fafc",
        borderColor: "#e2e8f0",
        borderRadius: 10,
        borderWidth: 1,
        gap: 6,
        marginBottom: 12,
        padding: 14,
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
        marginBottom: 16,
        textAlign: "center",
    },
    errorText: {
        color: "#ef4444",
        fontSize: 13,
    },
    errorTitle: {
        color: "#ef4444",
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
    },
    fileName: {
        flex: 1,
        fontWeight: "500",
        marginRight: 8,
    },
    fileSize: {
        color: "#94a3b8",
        fontSize: 13,
    },
    pickButton: {
        alignItems: "center",
        backgroundColor: "#3b82f6",
        borderRadius: 8,
        marginBottom: 24,
        paddingVertical: 14,
    },
    pickButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    processingRow: {
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
    },
    processingText: {
        color: "#f59e0b",
        fontSize: 13,
    },
    progressFill: {
        backgroundColor: "#3b82f6",
        borderRadius: 3,
        height: "100%",
    },
    progressTrack: {
        backgroundColor: "#e2e8f0",
        borderRadius: 3,
        height: 6,
        overflow: "hidden",
    },
    removeBtn: {
        paddingVertical: 4,
    },
    removeText: {
        color: "#ef4444",
        fontSize: 13,
    },
    retryBtn: {
        paddingVertical: 4,
    },
    retryText: {
        color: "#3b82f6",
        fontSize: 13,
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
