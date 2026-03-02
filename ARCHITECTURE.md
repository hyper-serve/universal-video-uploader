# Architecture

Universal Video Uploader is a cross-platform React library for uploading videos to any backend. It provides headless upload logic (state management, concurrency, validation, progress tracking) and optional composable UI components for React (web) and React Native.

## Package Structure

```
packages/
├── universal-video-uploader          # Core — headless logic, adapters, hooks
├── universal-video-uploader-react    # Web UI — DropZone, FileList, FileItem, etc.
└── universal-video-uploader-native   # RN UI — FilePicker, FileList, FileItem, etc.

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
          │ universal-video-uploader  │
          │ (core)                    │
          │                           │
          │ UploadProvider, useUpload  │
          │ Adapters, StatusChecker   │
          │ Validators, Platform utils│
          └───────────────────────────┘
```

The core package has **zero hard dependencies** beyond React as a peer dependency. `react-native-background-upload` is an optional peer for native background uploads.

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

### Concurrency

The provider processes files in FIFO order with a configurable concurrency limit (`maxConcurrentUploads`, default 3). Files stay in `"selected"` until a slot opens.

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

## Platform Split

Platform-specific behavior uses the `.native.ts` convention. Metro (React Native bundler) resolves `foo.js` to `foo.native.ts` when bundling for iOS/Android.

| Module | Web (.ts) | Native (.native.ts) |
|--------|-----------|---------------------|
| `adapter/hyperserve` | XHR with progress events, requires `file.raw` | `react-native-background-upload` with fallback to `fetch` |
| `platform/fileRef` | `File` → `FileRef` with `raw` and object URL | `DocumentPickerResult` → `FileRef` with `uri` only |
| `platform/thumbnail` | `URL.createObjectURL(file.raw)` | Returns `null` (not yet implemented) |
| `validation/maxDuration` | DOM video element for duration check | Warns and skips (returns valid) |

## Hyperserve Integration

The built-in `HyperserveAdapter` and `HyperserveStatusChecker` provide first-party support for the Hyperserve video API. A convenience factory wires everything together:

```typescript
const config = createHyperserveConfig({
  apiKey: "...",
  baseUrl: "https://api.hyperserve.io/v1",  // optional, this is the default
  uploadOptions: { resolutions: "480p,1080p", isPublic: true },
  validate: composeValidators(maxFileSize(500 * 1024 * 1024)),
  pollingIntervalMs: 3000,
});
```

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

## UI Packages

Both UI packages follow the same compound component pattern. They consume context from `UploadProvider` and provide composable building blocks.

### React (Web)

`DropZone` handles drag-and-drop and file input. `FileList` renders files with a render prop. `FileItem` is a compound component with sub-components (`.FileName`, `.FileSize`, `.ErrorMessage`, `.RemoveButton`, `.RetryButton`). `Thumbnail` supports a `playback` mode that renders a `<video>` element.

### React Native

`FilePicker` accepts a `pickFiles` prop (typically wrapping `expo-document-picker`). `FileList` uses `FlatList` and supports `numColumns` for grid layout. `FileItem` has the same compound component API. `Thumbnail` renders an `Image` (no built-in playback; examples use `expo-video` separately).

### Headless Usage

Both UI packages are optional. The core hooks (`useUpload`, `useFile`) provide everything needed to build fully custom UI.

## Validation

Validators are composable functions with the signature `(file: FileRef) => ValidationResult | Promise<ValidationResult>`:

| Validator | Platform | Description |
|-----------|----------|-------------|
| `maxFileSize(bytes)` | Both | Checks `file.size` |
| `allowedTypes(types)` | Both | Checks `file.type` against MIME types (supports wildcards) |
| `maxDuration(seconds)` | Web | Loads video metadata via DOM. Native variant warns and skips (see Known Limitations) |
| `composeValidators(...fns)` | Both | Runs validators in order, stops at first failure |

## Environment Variables

Examples use `.env` files (git-ignored) for API keys. `.env.example` files document the expected variables.

| Platform | Variable prefix | Config location |
|----------|----------------|-----------------|
| Web (Vite) | `VITE_` | `examples/web/.env` |
| React Native (Expo) | `EXPO_PUBLIC_` | `examples/react-native/.env` |

## Known Limitations

- **Native thumbnails**: `createThumbnail` returns `null` on React Native. Could be wired to thumbnail URLs from the API response.
- **`maxDuration` on RN**: Logs a warning and skips validation. The web version uses the DOM video element. A native implementation would require `expo-av` or similar.
- **Background upload progress**: The RN example does not include `react-native-background-upload`, so the fetch fallback reports approximate progress (50% → 100%).
