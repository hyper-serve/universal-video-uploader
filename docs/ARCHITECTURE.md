# Architecture

Universal Video Uploader is a cross-platform React library for uploading videos to any backend. It provides headless upload logic (state management, concurrency, validation, progress tracking) and optional composable UI components for React (web) and React Native.

## Package Structure

```
packages/
├── core                        # @hyperserve/upload — hooks, state machine, validation, theme
├── react                       # @hyperserve/upload-react — Web UI components
├── react-native                # @hyperserve/upload-react-native — React Native UI components
└── upload-adapter-hyperserve   # @hyperserve/upload-adapter-hyperserve — Official Hyperserve adapter

examples/
├── web/            # Vite + React 19
└── react-native/   # Expo 55 + React Native 0.83
```

### Dependency Graph

```
┌─────────────────────────────────────────────────────────┐
│  examples/web              examples/react-native         │
│  (Vite + React)            (Expo + RN)                   │
└─────────┬──────────────────────────┬────────────────────┘
          │                          │
┌─────────▼────────┐   ┌────────────▼─────────────┐
│ -react            │   │ -native                   │
│ DropZone, FileList│   │ FilePicker, FileList       │
│ FileItem, ...     │   │ FileItem, ...              │
└─────────┬────────┘   └────────────┬─────────────┘
          │                          │
          └────────────┬─────────────┘
                       │
          ┌────────────▼─────────────┐
          │ @hyperserve/upload         │
          │ (core)                    │
          │                           │
          │ UploadProvider, useUpload  │
          │ StatusChecker interface   │
          │ Validators, Platform utils│
          │ ViewModeProvider, theme   │
          └───────────────────────────┘
```

The core package has **zero hard dependencies** beyond React as a peer dependency. Adapters are separate packages — `@hyperserve/upload-adapter-hyperserve` adds `@hyperserve/hyperserve-js` as a dependency; third-party adapters for other video providers follow the same pattern.

## Core Concepts

### UploadAdapter\<TOptions\>

The adapter is responsible for uploading a file to a backend. The interface is generic over `TOptions`, so each backend defines its own options type:

```typescript
interface UploadAdapter<TOptions = Record<string, unknown>> {
  upload(
    file: FileRef,
    options: TOptions,
    callbacks: { onProgress: (pct: number) => void },
    signal: AbortSignal,
  ): Promise<UploadResult>;
}
```

The adapter owns its own auth and endpoint configuration via its constructor. The core never handles API keys or URLs directly.

### StatusChecker

Optional interface for post-upload status monitoring. Called after a successful upload when the backend needs time to process the video (transcoding, etc.):

```typescript
interface StatusChecker {
  checkStatus(options: {
    uploadResult: UploadResult;
    onStatusChange: (
      status: "processing" | "ready" | "failed",
      playbackUrl?: string,
      statusDetail?: string,
    ) => void;
    signal: AbortSignal;
  }): void;
}
```

If no `statusChecker` is provided, the file stays in `"processing"` after upload — the consumer can drive status updates externally.

If the adapter returns a `playbackUrl` in the `UploadResult`, the status checker is skipped entirely and the file transitions directly to `"ready"`.

### UploadConfig\<TOptions\>

Pairs an adapter with its options and optional behaviors:

```typescript
type UploadConfig<TOptions = Record<string, unknown>> = {
  adapter: UploadAdapter<TOptions>;
  uploadOptions: TOptions;
  statusChecker?: StatusChecker;
  validate?: (file: FileRef) => ValidationResult | Promise<ValidationResult>;
  maxConcurrentUploads?: number;
  maxFiles?: number;
  errorMessages?: ErrorMessages;
  onFileReady?: (file: FileState) => void;
  onUploadFailed?: (file: FileState) => void;
};
```

`onFileReady` and `onUploadFailed` fire exactly once per file per status transition. Use them to connect upload outcomes to app state (e.g. persist a `videoId` to your database after `onFileReady`).

`errorMessages` overrides the default user-facing strings for validation, upload, and processing failures:

```typescript
type ErrorMessages = {
  validationError?: string;
  uploadFailed?: string;
  processingFailed?: string;
};
```

The generic parameter ensures type safety between the adapter and its options at config construction time.

### UploadProvider

React context provider that manages the upload state machine. Generic over `TOptions`, inferred from the config prop:

```tsx
<UploadProvider config={config}>
  {/* children can use useUpload() and useFile() */}
</UploadProvider>
```

`useUpload()` returns:

```typescript
type UploadContextValue = {
  files: FileState[];
  addFiles: (files: FileRef[]) => void;
  removeFile: (id: string) => void;    // no-op for processing/ready (server-committed)
  retryFile: (id: string) => void;
  canAddMore: boolean;                 // false when files.length >= maxFiles
  maxFiles?: number;
  isUploading: boolean;                // true if any file is validating or uploading
  hasErrors: boolean;                  // true if any file is failed
  allReady: boolean;                   // true when all files are ready (and list non-empty)
  allSettled: boolean;                 // true when all files are ready or failed (and list non-empty)
  readyCount: number;                  // number of files with status "ready"
  failedCount: number;                 // number of files with status "failed"
};
```

## File State Machine

Every file goes through a defined set of statuses:

```
selected ──► validating ──► uploading ──► processing ──► ready
                │                │              │
                ▼                ▼              ▼
              failed          failed         failed

retry (from failed) ──► selected (re-enters the flow)
```

| Status | Description |
|--------|-------------|
| `selected` | File added, waiting for an upload slot |
| `validating` | Running client-side validation (size, type, duration) |
| `uploading` | Upload in progress, `progress` updates via adapter callback |
| `processing` | Upload complete, backend is processing (transcoding, etc.) |
| `ready` | Playback URL available |
| `failed` | Validation, upload, or processing failed. `error` contains the reason |

Files in `processing` or `ready` cannot be removed — they are committed to the server. `removeFile` on these statuses is a no-op. The file list is an append-only record of uploads in the current session.

`statusDetail` is populated during `processing` when the `StatusChecker` provides sub-status updates (e.g. `"Transcoding 480p"`). It is available on `FileState` for custom UI — render it yourself when `file.status === "processing" && file.statusDetail`.

### Concurrency

The provider processes files in FIFO order with a configurable concurrency limit (`maxConcurrentUploads`, default 3). Files stay in `"selected"` until a slot opens.

The scheduler is driven by a `schedulerTick` counter that is incremented whenever a slot opens (file completes, fails, is removed, or is retried). A separate `statusChangeTick` drives the `onFileReady` / `onUploadFailed` effect — it only increments on status transitions, not on progress or `statusDetail` updates, preventing unnecessary effect re-runs on every progress tick.

### State Shape

```typescript
type FileState = {
  id: string;
  ref: FileRef;
  status: FileStatus;
  progress: number;            // 0-100 during upload
  thumbnailUri: string | null; // Preview image (web only currently)
  playbackUrl: string | null;  // Available when ready
  videoId: string | null;      // Backend video ID
  error: string | null;        // Error message when failed
  statusDetail: string | null; // Sub-status from StatusChecker (e.g. "Transcoding 480p")
};
```

### Thumbnail Lifecycle

Thumbnails are created eagerly when a file is added via `addFiles`. The blob URL is stored in `thumbnailUrisRef` (separate from React state) and written into `FileState.thumbnailUri` via a dispatch. When a file transitions to `ready`, the blob URL is revoked and `thumbnailUri` is set to `null` (the playback URL takes over). On provider unmount, all remaining blob URLs are revoked.

## Platform Split

Platform-specific behavior uses the `.native.ts` convention. Metro (React Native bundler) resolves `foo.js` to `foo.native.ts` when bundling for iOS/Android.

| Module | Web (.ts) | Native (.native.ts) |
|--------|-----------|---------------------|
| `adapter/hyperserve` (adapter package) | XHR with progress events, requires `file.raw` | `react-native-background-upload` with fallback to `fetch` |
| `platform/fileRef` | `File` → `FileRef` with `raw` and object URL | `DocumentPickerResult` → `FileRef` with `uri` only |
| `platform/thumbnail` | `URL.createObjectURL(file.raw)` | Returns `null` (not yet implemented) |
| `validation/maxDuration` | DOM video element for duration check | Warns and skips (returns valid) |

`FileRef` is a discriminated union on `platform`:

```typescript
type WebFileRef  = { platform: "web";    uri: string; name: string; size: number; type: string; raw: File; };
type NativeFileRef = { platform: "native"; uri: string; name: string; size: number; type: string; };
type FileRef = WebFileRef | NativeFileRef;
```

## Hyperserve Integration

The `@hyperserve/upload-adapter-hyperserve` package provides `HyperserveAdapter` and `HyperserveStatusChecker`. A convenience factory wires everything together:

```typescript
import { createHyperserveConfig } from "@hyperserve/upload-adapter-hyperserve";

const config = createHyperserveConfig({
  createUpload: async (file, options) =>
    fetch("/api/create-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: file.name, size: file.size, ...options }),
    }).then((r) => r.json()),
  completeUpload: async (videoId) => {
    await fetch(`/api/complete-upload/${videoId}`, { method: "POST" });
  },
  getVideoStatus: async (videoId) =>
    fetch(`/api/video-status/${videoId}`).then((r) => r.json()),
  uploadOptions: {
    resolutions: ["480p", "1080p"],
    isPublic: true,
    metadata: { postId: "123", entityType: "post" },
  },
  errorMessages: {
    uploadFailed: "Upload failed. Please try again.",
  },
  validate: composeValidators(maxFileSize(500 * 1024 * 1024)),
  pollingIntervalMs: 3000,
});
```

The callbacks call your backend, which proxies to Hyperserve with your API key. The adapter uses `@hyperserve/hyperserve-js` SDK internally to upload files to the presigned storage URL returned by `createUpload`.

### Upload flow

1. `createUpload(file, options)` — your backend creates a video record and returns `{ videoId, uploadUrl, contentType }`
2. `putVideoToStorage(...)` (SDK) — the adapter uploads the file bytes to the presigned `uploadUrl`
3. `completeUpload(videoId)` — your backend signals Hyperserve that the upload is finished

### Custom metadata

`HyperserveUploadOptions.metadata` is sent on the create-video request and included in Hyperserve webhook payloads when processing completes. Use it to associate uploads with entities in your app (post ID, product ID, etc.). Upload options are shared for the whole provider session — all files receive the same `uploadOptions`.

### Config identity

`HyperserveAdapter` and `HyperserveStatusChecker` are stateless between calls so swapping instances mid-session is harmless. The `configRef.current = config` pattern in `UploadProvider` is intentional — it allows deliberate config changes (e.g. toggling `isPublic`) to be picked up by the next queued file. The result of `createHyperserveConfig` should be created outside the render function or wrapped in `useMemo` to avoid unnecessary object churn.

### Custom Backend

For non-Hyperserve backends (Mux, api.video, Bunny, custom), implement `UploadAdapter<YourOptions>` and optionally `StatusChecker`:

```typescript
type MuxOptions = { playbackPolicy: "public" | "signed" };

class MuxAdapter implements UploadAdapter<MuxOptions> {
  constructor(private tokenEndpoint: string) {}
  async upload(file, options, callbacks, signal) { /* ... */ }
}

const config: UploadConfig<MuxOptions> = {
  adapter: new MuxAdapter("/api/mux-upload-url"),
  uploadOptions: { playbackPolicy: "public" },
};
```

## Shared Theme and Status Config

The core package exports a design token system consumed by both UI packages. This keeps visual consistency without requiring a shared CSS layer:

```typescript
import {
  themeColors,     // accent, error, border, bg variants, etc.
  themeRadius,     // sm, md, lg, xl, pill
  themeFontScale,  // xs, sm, md, lg, xl (pixel values; web converts to rem)
  themeSpacingScale, // xxs, xs, sm, … cardX, cardY, dropZone, etc.
  statusConfig,    // Record<FileStatus, { bg, text, label }>
} from "@hyperserve/upload";
```

`statusConfig` maps every `FileStatus` to a color pair and default label. UI packages consume it directly; consumers can override per-status entries when using `StatusBadge`.

## View Mode

`ViewModeProvider` and `useViewMode` live in the **core** package and are re-exported by both UI packages. This avoids duplicating the context across platform packages:

```tsx
<UploadProvider config={config}>
  <ViewModeProvider defaultMode="list">
    <DropZone />
    <FileListToolbar right={<FileListToolbar.ViewToggle />} />
    <FileList />
  </ViewModeProvider>
</UploadProvider>
```

`FileList` defaults to `"list"` mode when rendered outside a `ViewModeProvider`. The `mode` prop always takes precedence over context.

## UI Packages

Both UI packages follow the same compound component pattern. They consume context from `UploadProvider` and provide composable building blocks.

### React (Web)

#### DropZone

Handles drag-and-drop and file input. Accepts `accept`, `multiple`, and `disabled` props alongside the standard `style`/`className`.

#### FileList

Renders the file list with optional custom item renderer:

```typescript
type FileListProps = {
  mode?: ViewMode;
  style?: React.CSSProperties;
  className?: string;
  columns?: string;                // CSS grid-template-columns for grid mode
  emptyMessage?: React.ReactNode;  // shown when files is empty
  emptyClassName?: string;
  emptyStyle?: React.CSSProperties;
  renderEmpty?: () => React.ReactNode; // overrides emptyMessage
  children?: (file: FileState, index: number) => React.ReactNode;
};
```

When `children` is omitted, `FileList` renders a default `FileItem` per file — `row` layout in list mode, `column` layout in grid mode.

#### FileItem

Compound component with a `layout` prop (`"row"` | `"column"`, default `"column"`). Sub-components:

| Sub-component | Description |
|---------------|-------------|
| `FileItem.FileName` | File name, truncated with ellipsis |
| `FileItem.FileSize` | Human-readable size |
| `FileItem.ErrorMessage` | Renders `file.error` when present |
| `FileItem.RemoveButton` | Hidden during `processing`/`ready`. `aria-label` switches to `cancelLabel` when `uploading`/`validating` |
| `FileItem.RetryButton` | Only shown when `failed` |
| `FileItem.StatusIcon` | Spinner during `processing`, check mark when `ready` |
| `FileItem.Meta` | Flex row container for status metadata |
| `FileItem.Actions` | Flex column container for action buttons |
| `FileItem.UploadProgress` | `ProgressBar` visible only during `uploading` |
| `FileItem.PlaybackPreview` | `Thumbnail` in playback mode, visible only when `ready` |
| `FileItem.Content` | Opinionated default layout combining the above sub-components; adapts to `layout` |

`children` on `FileItem` can be a render function: `children={(file) => ...}`.

#### FileListToolbar

Toolbar with configurable left and right slots:

```typescript
type FileListToolbarProps = {
  left?: React.ReactNode | null;   // defaults to FileCount
  right?: React.ReactNode | null;  // defaults to ViewToggle
  showFileCount?: boolean;         // false disables default left slot
  showViewToggle?: boolean;        // false disables default right slot
  style?: React.CSSProperties;
  className?: string;
};
```

Sub-components:

- `FileListToolbar.FileCount` — shows `"N files added"` by default; accepts a `label` render prop `(count) => ReactNode`
- `FileListToolbar.ViewToggle` — list/grid toggle buttons; accepts a `children` render prop for custom toggle UI

#### StatusBadge

Pill badge for a `FileStatus`. Fully customizable:

```typescript
type StatusBadgeProps = {
  status: FileStatus;
  statusConfig?: Partial<Record<FileStatus, StatusConfigEntry>>; // per-status overrides
  getLabel?: (status: FileStatus) => string;
  children?: (info: { label: string; color: string }) => React.ReactNode; // headless mode
  style?: React.CSSProperties;
  className?: string;
};
```

#### ProgressBar

Standalone progress track + fill component. Accepts `progress` (0–100) plus separate `trackStyle`/`fillStyle` and `trackClassName`/`fillClassName` for both track and fill elements.

#### Thumbnail

Renders a thumbnail image from `file.thumbnailUri`. Accepts a `playback` boolean — when true and `file.playbackUrl` is set, renders a `<video>` element instead.

### React Native

`FilePicker` accepts a `pickFiles` prop (typically wrapping `expo-document-picker`). `FileList` uses `FlatList` and supports `numColumns` for grid layout. `FileItem` has the same compound component API. `Thumbnail` renders an `Image` (no built-in playback; examples use `expo-video` separately). Both `ViewModeProvider`/`useViewMode` and `FileListToolbar` are present with the same API as the web package.

### Headless Usage

Both UI packages are optional. The core hooks (`useUpload`, `useFile`) provide everything needed to build fully custom UI.

## Validation

Validators are composable functions. The `Validator` type is exported from the core:

```typescript
type Validator = (file: FileRef) => ValidationResult | Promise<ValidationResult>;
```

| Validator | Platform | Description |
|-----------|----------|-------------|
| `maxFileSize(bytes)` | Both | Checks `file.size` |
| `allowedTypes(types)` | Both | Checks `file.type` against MIME types (supports wildcards) |
| `maxDuration(seconds)` | Both | Web uses DOM video element; native uses `expo-video-metadata` (optional peer dep, skips if missing) |
| `composeValidators(...fns)` | Both | Runs validators in order, stops at first failure |

## Environment Variables

Examples use `.env` files (git-ignored) for API keys. `.env.example` files document the expected variables.

| Platform | Variable prefix | Config location |
|----------|----------------|-----------------|
| Web (Vite) | `VITE_` | `examples/web/.env` |
| React Native (Expo) | `EXPO_PUBLIC_` | `examples/react-native/.env` |

## Optional Native Dependencies

All three are optional peer dependencies of the core package. When missing, the library gracefully degrades:

| Package | Purpose | Fallback without it |
|---------|---------|---------------------|
| `expo-video-metadata` | `maxDuration` validation on native | Skips validation, warns once |
| `expo-video-thumbnails` | Thumbnail generation on native | `thumbnailUri` stays `null` |
| `react-native-background-upload` | True background upload with granular progress | Falls back to `fetch` with estimated progress |
