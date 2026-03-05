import React, {
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
} from "react";
import { createThumbnail, revokeThumbnail } from "./platform/thumbnail.js";
import type {
	FileRef,
	FileState,
	FileStatus,
	UploadConfig,
	UploadContextValue,
	ViewMode,
} from "./types.js";

function generateId(): string {
	if (typeof crypto !== "undefined" && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
		/[xy]/g,
		(c) => {
			const r = (Math.random() * 16) | 0;
			const v = c === "x" ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		},
	);
}

type FileAction =
	| { files: FileState[]; type: "ADD_FILES" }
	| { type: "CLEAR_COMPLETED" }
	| { id: string; type: "REMOVE_FILE" }
	| { id: string; type: "RETRY_FILE" }
	| { id: string; type: "UPDATE_FILE"; updates: Partial<FileState> };

function fileReducer(state: FileState[], action: FileAction): FileState[] {
	switch (action.type) {
		case "ADD_FILES":
			return [...state, ...action.files];
		case "UPDATE_FILE":
			return state.map((f) =>
				f.id === action.id ? { ...f, ...action.updates } : f,
			);
		case "REMOVE_FILE":
			return state.filter((f) => f.id !== action.id);
		case "RETRY_FILE":
			return state.map((f) =>
				f.id === action.id
					? {
							...f,
							error: null,
							progress: 0,
							status: "selected" as const,
							statusDetail: null,
						}
					: f,
			);
		case "CLEAR_COMPLETED":
			return state.filter((f) => f.status !== "ready");
		default:
			return state;
	}
}

export const UploadContext = createContext<UploadContextValue | null>(null);

type UploadProviderProps<TOptions> = {
	children:
		| React.ReactNode
		| ((value: UploadContextValue) => React.ReactNode);
	config: UploadConfig<TOptions>;
};

export function UploadProvider<TOptions>({
	config,
	children,
}: UploadProviderProps<TOptions>) {
	const [files, dispatch] = useReducer(fileReducer, []);
	const [viewMode, setViewMode] = useState<ViewMode>("list");

	const configRef = useRef(config);
	configRef.current = config;
	const filesCountRef = useRef(0);
	filesCountRef.current = files.length;

	const abortControllers = useRef(new Map<string, AbortController>());
	const processingIds = useRef(new Set<string>());

	const processFile = useCallback(
		async (file: FileState) => {
			const ac = new AbortController();
			abortControllers.current.set(file.id, ac);
			const cfg = configRef.current;

			if (cfg.validate) {
				dispatch({
					id: file.id,
					type: "UPDATE_FILE",
					updates: { status: "validating" },
				});
				try {
					const result = await cfg.validate(file.ref);
					if (!result.valid) {
						dispatch({
							id: file.id,
							type: "UPDATE_FILE",
							updates: { error: result.reason, status: "failed" },
						});
						processingIds.current.delete(file.id);
						return;
					}
				} catch {
					dispatch({
						id: file.id,
						type: "UPDATE_FILE",
						updates: { error: "Validation error", status: "failed" },
					});
					processingIds.current.delete(file.id);
					return;
				}
			}

			dispatch({
				id: file.id,
				type: "UPDATE_FILE",
				updates: { status: "uploading" },
			});

			try {
				const uploadResult = await cfg.adapter.upload(
					file.ref,
					cfg.uploadOptions,
					{
						onProgress: (pct) =>
							dispatch({
								id: file.id,
								type: "UPDATE_FILE",
								updates: { progress: pct },
							}),
					},
					ac.signal,
				);

				if (uploadResult.playbackUrl) {
					dispatch({
						id: file.id,
						type: "UPDATE_FILE",
						updates: {
							playbackUrl: uploadResult.playbackUrl,
							progress: 100,
							status: "ready",
							videoId: uploadResult.videoId,
						},
					});
					processingIds.current.delete(file.id);
					return;
				}

				dispatch({
					id: file.id,
					type: "UPDATE_FILE",
					updates: {
						progress: 100,
						status: "processing",
						videoId: uploadResult.videoId,
					},
				});

				if (cfg.statusChecker) {
					cfg.statusChecker.checkStatus({
						onStatusChange: (status, playbackUrl, statusDetail) => {
							if (status === "processing") {
								dispatch({
									id: file.id,
									type: "UPDATE_FILE",
									updates: {
										statusDetail: statusDetail ?? null,
									},
								});
								return;
							}

							dispatch({
								id: file.id,
								type: "UPDATE_FILE",
								updates: {
									error:
										status === "failed"
											? "Processing failed"
											: null,
									playbackUrl: playbackUrl ?? null,
									status:
										status === "ready" ? "ready" : "failed",
									statusDetail: null,
								},
							});
							processingIds.current.delete(file.id);
						},
						signal: ac.signal,
						uploadResult,
					});
				} else {
					processingIds.current.delete(file.id);
				}
			} catch (err) {
				if (!ac.signal.aborted) {
					dispatch({
						id: file.id,
						type: "UPDATE_FILE",
						updates: {
							error:
								err instanceof Error ? err.message : "Upload failed",
							status: "failed",
						},
					});
				}
				processingIds.current.delete(file.id);
			}
		},
		[],
	);

	useEffect(() => {
		const maxConcurrent = configRef.current.maxConcurrentUploads ?? 3;
		const activeCount = files.filter(
			(f) => f.status === "validating" || f.status === "uploading",
		).length;
		const slotsAvailable = maxConcurrent - activeCount;

		if (slotsAvailable <= 0) return;

		const pending = files.filter(
			(f) =>
				f.status === "selected" && !processingIds.current.has(f.id),
		);

		for (let i = 0; i < Math.min(slotsAvailable, pending.length); i++) {
			processingIds.current.add(pending[i].id);
			processFile(pending[i]);
		}
	}, [files, processFile]);

	useEffect(() => {
		return () => {
			for (const ac of abortControllers.current.values()) {
				ac.abort();
			}
		};
	}, []);

	const addFiles = useCallback((refs: FileRef[]) => {
		const maxFiles = configRef.current.maxFiles;
		const currentCount = filesCountRef.current;
		const allowed = maxFiles == null
			? refs
			: refs.slice(0, Math.max(0, maxFiles - currentCount));
		if (allowed.length === 0) return;

		const newFiles: FileState[] = allowed.map((ref) => ({
			error: null,
			id: generateId(),
			playbackUrl: null,
			progress: 0,
			ref,
			status: "selected" as const,
			statusDetail: null,
			thumbnailUri: null,
			videoId: null,
		}));
		dispatch({ files: newFiles, type: "ADD_FILES" });

		for (const file of newFiles) {
			createThumbnail(file.ref).then((uri) => {
				if (uri) {
					dispatch({
						id: file.id,
						type: "UPDATE_FILE",
						updates: { thumbnailUri: uri },
					});
				}
			});
		}
	}, []);

	const removeFile = useCallback(
		(id: string) => {
			const file = files.find((f) => f.id === id);
			if (
				file?.status === "processing" ||
				file?.status === "ready"
			) {
				return;
			}
			if (file?.thumbnailUri) {
				revokeThumbnail(file.thumbnailUri);
			}
			const ac = abortControllers.current.get(id);
			if (ac) {
				ac.abort();
				abortControllers.current.delete(id);
			}
			processingIds.current.delete(id);
			dispatch({ id, type: "REMOVE_FILE" });
		},
		[files],
	);

	const retryFile = useCallback((id: string) => {
		const ac = abortControllers.current.get(id);
		if (ac) {
			ac.abort();
			abortControllers.current.delete(id);
		}
		processingIds.current.delete(id);
		dispatch({ id, type: "RETRY_FILE" });
	}, []);

	const clearCompleted = useCallback(() => {
		for (const file of files) {
			if (file.status === "ready" && file.thumbnailUri) {
				revokeThumbnail(file.thumbnailUri);
			}
		}
		dispatch({ type: "CLEAR_COMPLETED" });
	}, [files]);

	const maxFiles = configRef.current.maxFiles;
	const canAddMore = maxFiles == null || files.length < maxFiles;

	const value: UploadContextValue = useMemo(
		() => ({
			addFiles,
			canAddMore,
			clearCompleted,
			files,
			maxFiles,
			removeFile,
			retryFile,
			setViewMode,
			viewMode,
		}),
		[
			files,
			addFiles,
			removeFile,
			retryFile,
			clearCompleted,
			viewMode,
			setViewMode,
			maxFiles,
			canAddMore,
		],
	);

	const prevStatusById = useRef<Map<string, FileStatus>>(new Map());
	useEffect(() => {
		const cfg = configRef.current;
		const onReady = cfg.onFileReady;
		const onFailed = cfg.onUploadFailed;
		if (!onReady && !onFailed) return;
		const prev = prevStatusById.current;
		for (const file of files) {
			const p = prev.get(file.id);
			if (file.status === "ready" && p !== undefined && p !== "ready") {
				onReady?.(file);
			} else if (file.status === "failed" && p !== undefined && p !== "failed") {
				onFailed?.(file);
			}
			prev.set(file.id, file.status);
		}
		for (const id of prev.keys()) {
			if (!files.some((f) => f.id === id)) prev.delete(id);
		}
	}, [files]);

	return (
		<UploadContext.Provider value={value}>
			{typeof children === "function" ? children(value) : children}
		</UploadContext.Provider>
	);
}
