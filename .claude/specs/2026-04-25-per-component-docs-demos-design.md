# Per-Component Docs Demos Design

**Date:** 2026-04-25  
**Status:** Approved

## Problem

The docs component pages are inconsistent:
- `DropZone` and `FileItem` show a full-stack interactive demo (all components together)
- `ProgressBar`, `StatusBadge`, `Thumbnail`, `FileListToolbar`, `FileList` have no demo at all
- `HeadlessDemo` exists but is referenced nowhere in the docs
- No component page has a prose description below the title

The goal: each component page shows **that component** rendered in its meaningful states, plus a description.

## Solution Overview

Add shared demo infrastructure (`mockFileState.ts`, `MockFilesProvider.tsx`) and create one targeted demo per component. Update each `.mdx` page to use the targeted demo and add a prose description. Wire `HeadlessDemo` to the headless guide.

---

## Infrastructure

### `mockFileState.ts`
Location: `packages/docs/src/components/demos/mockFileState.ts`

Exports a `mockFile(overrides)` factory returning a fully-typed `FileState`. The `ref.raw` field is cast (`null as unknown as File`) since no UI component reads it.

Exports named presets for reuse:
- `selectedFile` — status: `"selected"`, progress: 0
- `uploadingFile` — status: `"uploading"`, progress: 55
- `processingFile` — status: `"processing"`, statusDetail: `"Transcoding 60%"`
- `readyFile` — status: `"ready"`, playbackUrl: `"https://example.com/video.mp4"`
- `failedFile` — status: `"failed"`, error: `"Upload failed. Check your connection."`

All presets share a common `ref`: `{ platform: "web", name: "sample-video.mp4", size: 52428800, type: "video/mp4", uri: "", raw: null as unknown as File }`.

### `MockFilesProvider.tsx`
Location: `packages/docs/src/components/demos/MockFilesProvider.tsx`

Wraps `<UploadContext.Provider>` (exported from `@hyperserve/upload`) with a static `UploadContextValue`:
- `files`: accepts a `files: FileState[]` prop
- All mutating callbacks (`addFiles`, `removeFile`, `retryFile`, `updateFileStatus`) are no-ops
- Derived booleans (`canAddMore`, `isUploading`, etc.) computed from the files array
- Also wraps `<ViewModeProvider>` so components using `useViewMode()` work

Props:
```ts
type MockFilesProviderProps = {
  files: FileState[];
  defaultMode?: "list" | "grid";
  children: React.ReactNode;
};
```

---

## New Demo Files

All in `packages/docs/src/components/demos/`.

### `ProgressBarDemo.tsx`
- No context needed
- Renders 4 `ProgressBar` instances at 0%, 33%, 67%, 100%
- Each labeled with its value
- Layout: vertical column

### `StatusBadgeDemo.tsx`
- No context needed
- Renders all 6 `StatusBadge` statuses in a flex-wrap row: `selected`, `validating`, `uploading`, `processing`, `ready`, `failed`

### `ThumbnailDemo.tsx`
- No context needed
- Renders 3 `Thumbnail` instances side by side, each labeled:
  1. Placeholder — `thumbnailUri: null`, status: `"uploading"`
  2. Image — `thumbnailUri` set to a gray 160×90 data URI (`data:image/svg+xml,...` SVG rectangle), status: `"uploading"`
  3. Ready — `status: "ready"`, no real `playbackUrl` so renders placeholder (documents that behavior too)

### `FileItemDemo.tsx`
- No external context needed (`FileItem` creates its own internal context)
- Renders 4 `FileItem` instances using the named presets:
  1. Uploading — `uploadingFile`, layout: `"row"`
  2. Processing — `processingFile`, layout: `"row"`
  3. Ready — `readyFile`, layout: `"row"`
  4. Failed — `failedFile`, layout: `"row"`

### `FileListDemo.tsx`
- Wraps `MockFilesProvider` with 4 mock files (one per non-selected status)
- Renders two `FileList` instances: list mode and grid mode, stacked vertically with a label between them

### `FileListToolbarDemo.tsx`
- Wraps `MockFilesProvider` (3 mock files) + renders `FileListToolbar` with default slots
- `FileCount` reads real file count from context → shows "3 files added"
- `ViewToggle` is functional (real `ViewModeProvider` from `MockFilesProvider`)

### `DropZoneDemo.tsx`
- Slim interactive demo: `UploadProvider` with `MockAdapter` but **no `FileList` or toolbar**
- Just the `DropZone` component alone
- Small "N files queued" label beneath using `useUpload().files.length`
- Keeps the page focused on the drop zone, not the full upload flow

---

## Docs Page Updates

Each component `.mdx` in `packages/docs/src/content/docs/components/` gets:

1. **Prose description paragraph** — 1–2 sentences below the title, before any code blocks, describing the component's purpose and typical usage context.
2. **Targeted demo** — import and render the new demo component with `client:load`.

| Page | Current demo | New demo |
|------|-------------|----------|
| `drop-zone.mdx` | `DefaultDemo` | `DropZoneDemo` |
| `file-item.mdx` | `ComposableDemo` | `FileItemDemo` (states: uploading, processing, ready, failed) |
| `file-list.mdx` | none | `FileListDemo` |
| `file-list-toolbar.mdx` | none | `FileListToolbarDemo` |
| `progress-bar.mdx` | none | `ProgressBarDemo` |
| `status-badge.mdx` | none | `StatusBadgeDemo` |
| `thumbnail.mdx` | none | `ThumbnailDemo` |

### Existing full-stack demos
- `DefaultDemo` — remove from `drop-zone.mdx`; keep available for quick-start or overview pages if needed
- `ComposableDemo` — move to `packages/docs/src/content/docs/getting-started/quick-start.mdx` to show the composable layout pattern in context
- `HeadlessDemo` — add to `packages/docs/src/content/docs/guides/headless.mdx`

---

## What Is Not Changing

- The `MockAdapter.ts` (used by existing interactive demos) — unchanged
- The `DefaultDemo`, `ComposableDemo`, `HeadlessDemo` files — unchanged (only their usage in pages changes)
- Component source code in `packages/react/src/` — no changes
- Core package exports — no changes

---

## Out of Scope

- Dark mode theming for demos
- Interactive controls (sliders, dropdowns) to change demo state
- Demo code tabs (show/hide source)
