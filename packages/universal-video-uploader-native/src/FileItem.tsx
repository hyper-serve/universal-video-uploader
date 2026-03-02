import React, { createContext, useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { FileState } from "@hyperserve/universal-video-uploader";
import { useUpload } from "@hyperserve/universal-video-uploader";
import type { StyleProp, ViewStyle, TextStyle } from "react-native";

type FileItemContextValue = {
	file: FileState;
};

const FileItemContext = createContext<FileItemContextValue | null>(null);

function useFileItemContext(): FileItemContextValue {
	const ctx = useContext(FileItemContext);
	if (!ctx) {
		throw new Error(
			"FileItem compound components must be used within <FileItem>",
		);
	}
	return ctx;
}

export type FileItemProps = {
	file: FileState;
	style?: StyleProp<ViewStyle>;
	children?:
		| React.ReactNode
		| ((file: FileState) => React.ReactNode);
};

export function FileItem({ file, style, children }: FileItemProps) {
	return (
		<FileItemContext.Provider value={{ file }}>
			<View style={[styles.container, style]}>
				{typeof children === "function" ? children(file) : children}
			</View>
		</FileItemContext.Provider>
	);
}

export type FileNameProps = {
	style?: StyleProp<TextStyle>;
	numberOfLines?: number;
};

function FileName({ style, numberOfLines = 1 }: FileNameProps) {
	const { file } = useFileItemContext();
	return (
		<Text numberOfLines={numberOfLines} style={[styles.fileName, style]}>
			{file.ref.name}
		</Text>
	);
}

export type FileSizeProps = {
	style?: StyleProp<TextStyle>;
};

function FileSize({ style }: FileSizeProps) {
	const { file } = useFileItemContext();
	const mb = file.ref.size / (1024 * 1024);
	return (
		<Text style={[styles.fileSize, style]}>
			{mb < 1 ? `${(file.ref.size / 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`}
		</Text>
	);
}

export type ErrorMessageProps = {
	style?: StyleProp<TextStyle>;
};

function ErrorMessage({ style }: ErrorMessageProps) {
	const { file } = useFileItemContext();
	if (!file.error) return null;
	return <Text style={[styles.error, style]}>{file.error}</Text>;
}

export type RemoveButtonProps = {
	style?: StyleProp<ViewStyle>;
	textStyle?: StyleProp<TextStyle>;
	children?: React.ReactNode;
};

function RemoveButton({ style, textStyle, children }: RemoveButtonProps) {
	const { file } = useFileItemContext();
	const { removeFile } = useUpload();
	return (
		<Pressable onPress={() => removeFile(file.id)} style={style}>
			{children ?? (
				<Text style={[styles.removeText, textStyle]}>Remove</Text>
			)}
		</Pressable>
	);
}

export type RetryButtonProps = {
	style?: StyleProp<ViewStyle>;
	textStyle?: StyleProp<TextStyle>;
	children?: React.ReactNode;
};

function RetryButton({ style, textStyle, children }: RetryButtonProps) {
	const { file } = useFileItemContext();
	const { retryFile } = useUpload();
	if (file.status !== "failed") return null;
	return (
		<Pressable onPress={() => retryFile(file.id)} style={style}>
			{children ?? (
				<Text style={[styles.retryText, textStyle]}>Retry</Text>
			)}
		</Pressable>
	);
}

FileItem.FileName = FileName;
FileItem.FileSize = FileSize;
FileItem.ErrorMessage = ErrorMessage;
FileItem.RemoveButton = RemoveButton;
FileItem.RetryButton = RetryButton;

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#f8fafc",
		borderColor: "#e2e8f0",
		borderRadius: 10,
		borderWidth: 1,
		gap: 6,
		padding: 14,
	},
	error: {
		color: "#ef4444",
		fontSize: 13,
	},
	fileName: {
		flex: 1,
		fontWeight: "500",
	},
	fileSize: {
		color: "#94a3b8",
		fontSize: 13,
	},
	removeText: {
		color: "#ef4444",
		fontSize: 13,
	},
	retryText: {
		color: "#3b82f6",
		fontSize: 13,
	},
});
