# Per-Component Docs Demos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every component docs page a targeted static demo showing that component in its meaningful states, plus a prose description below the title.

**Architecture:** Add two shared infrastructure files (`mockFileState.ts`, `MockFilesProvider.tsx`) then create one `*Demo.tsx` per component. Update each `.mdx` page to import its demo and add a description paragraph. Wire `ComposableDemo` into `quick-start.mdx`.

**Tech Stack:** Astro + Starlight, React 19, `@hyperserve/upload` (core), `@hyperserve/upload-react` (UI components), Biome (lint/format), Bun.

---

## File Map

**Create:**
- `packages/docs/src/components/demos/mockFileState.ts`
- `packages/docs/src/components/demos/MockFilesProvider.tsx`
- `packages/docs/src/components/demos/ProgressBarDemo.tsx`
- `packages/docs/src/components/demos/StatusBadgeDemo.tsx`
- `packages/docs/src/components/demos/ThumbnailDemo.tsx`
- `packages/docs/src/components/demos/FileItemDemo.tsx`
- `packages/docs/src/components/demos/DropZoneDemo.tsx`
- `packages/docs/src/components/demos/FileListToolbarDemo.tsx`
- `packages/docs/src/components/demos/FileListDemo.tsx`

**Modify:**
- `packages/docs/src/content/docs/components/progress-bar.mdx`
- `packages/docs/src/content/docs/components/status-badge.mdx`
- `packages/docs/src/content/docs/components/thumbnail.mdx`
- `packages/docs/src/content/docs/components/file-item.mdx`
- `packages/docs/src/content/docs/components/drop-zone.mdx`
- `packages/docs/src/content/docs/components/file-list-toolbar.mdx`
- `packages/docs/src/content/docs/components/file-list.mdx`
- `packages/docs/src/content/docs/getting-started/quick-start.mdx`

**No changes:** `MockAdapter.ts`, `DefaultDemo.tsx`, `ComposableDemo.tsx`, `HeadlessDemo.tsx`, all `packages/react/src/` files. (`headless.mdx` already has `HeadlessDemo` — no change needed.)

---

## Task 1: Create `mockFileState.ts`

**Files:**
- Create: `packages/docs/src/components/demos/mockFileState.ts`

- [ ] **Step 1: Create the file**

```ts
import type { FileState } from "@hyperserve/upload";

export const mockRef = {
	platform: "web" as const,
	name: "sample-video.mp4",
	size: 52428800,
	type: "video/mp4",
	uri: "",
	raw: null as unknown as File,
};

const base: FileState = {
	id: "mock",
	ref: mockRef,
	status: "selected",
	progress: 0,
	thumbnailUri: null,
	playbackUrl: null,
	videoId: null,
	error: null,
	statusDetail: null,
};

export function mockFile(overrides: Partial<FileState> = {}): FileState {
	return { ...base, ...overrides };
}

export const selectedFile: FileState = {
	...base,
	id: "mock-selected",
	status: "selected",
};

export const uploadingFile: FileState = {
	...base,
	id: "mock-uploading",
	status: "uploading",
	progress: 55,
};

export const processingFile: FileState = {
	...base,
	id: "mock-processing",
	status: "processing",
	statusDetail: "Transcoding 60%",
};

export const readyFile: FileState = {
	...base,
	id: "mock-ready",
	status: "ready",
	playbackUrl: "https://example.com/video.mp4",
};

export const failedFile: FileState = {
	...base,
	id: "mock-failed",
	status: "failed",
	error: "Upload failed. Check your connection.",
};
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/components/demos/mockFileState.ts
git commit -m "feat(docs): add mockFileState factory and presets"
```

---

## Task 2: Create `MockFilesProvider.tsx`

**Files:**
- Create: `packages/docs/src/components/demos/MockFilesProvider.tsx`

- [ ] **Step 1: Create the file**

`UploadContext` and `ViewModeProvider` are both exported from `@hyperserve/upload` (the core package). `UploadContext` is a `React.Context<UploadContextValue | null>` — we provide a static value directly. `ViewModeProvider` manages the `list`/`grid` toggle state that `FileListToolbar.ViewToggle` and `FileList` read.

```tsx
import {
	UploadContext,
	ViewModeProvider,
	type FileState,
	type UploadContextValue,
} from "@hyperserve/upload";
import type React from "react";
import { useMemo } from "react";

type MockFilesProviderProps = {
	files: FileState[];
	defaultMode?: "list" | "grid";
	children: React.ReactNode;
};

export function MockFilesProvider({
	files,
	defaultMode = "list",
	children,
}: MockFilesProviderProps) {
	const value: UploadContextValue = useMemo(
		() => ({
			files,
			addFiles: () => {},
			removeFile: () => {},
			retryFile: () => {},
			updateFileStatus: () => {},
			canAddMore: true,
			isUploading: files.some((f) => f.status === "uploading"),
			hasErrors: files.some((f) => f.status === "failed"),
			allReady: files.length > 0 && files.every((f) => f.status === "ready"),
			allSettled:
				files.length > 0 &&
				files.every((f) => f.status === "ready" || f.status === "failed"),
			readyCount: files.filter((f) => f.status === "ready").length,
			failedCount: files.filter((f) => f.status === "failed").length,
		}),
		[files],
	);

	return (
		<UploadContext.Provider value={value}>
			<ViewModeProvider defaultMode={defaultMode}>{children}</ViewModeProvider>
		</UploadContext.Provider>
	);
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/components/demos/MockFilesProvider.tsx
git commit -m "feat(docs): add MockFilesProvider for static context injection"
```

---

## Task 3: `ProgressBarDemo.tsx` + update `progress-bar.mdx`

**Files:**
- Create: `packages/docs/src/components/demos/ProgressBarDemo.tsx`
- Modify: `packages/docs/src/content/docs/components/progress-bar.mdx`

- [ ] **Step 1: Create `ProgressBarDemo.tsx`**

```tsx
import { ProgressBar } from "@hyperserve/upload-react";
import type React from "react";

const values = [0, 33, 67, 100];

export default function ProgressBarDemo() {
	return (
		<div
			style={{
				background: "#fff",
				border: "1px solid #e2e8f0",
				borderRadius: 8,
				display: "flex",
				flexDirection: "column",
				gap: "1.25rem",
				padding: "1.5rem",
			}}
		>
			{values.map((v) => (
				<div
					key={v}
					style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}
				>
					<span
						style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}
					>
						{v}%
					</span>
					<ProgressBar progress={v} />
				</div>
			))}
		</div>
	);
}
```

- [ ] **Step 2: Update `progress-bar.mdx`**

Add an import and render at the top of the file, plus a prose description. The file currently starts at `## Usage`. Add before it:

```mdx
---
title: ProgressBar
description: Standalone progress track and fill component.
---

import ProgressBarDemo from "../../../components/demos/ProgressBarDemo";

ProgressBar renders a track-and-fill progress indicator. It accepts `progress` (0–100) and optional style props for both the track and fill elements independently.

<ProgressBarDemo client:load />

## Usage
```

(Replace the entire file with the content above merged into the existing file — keep everything from `## Usage` onward unchanged.)

- [ ] **Step 3: Build check**

```bash
bun docs:build
```

Expected: build succeeds with no type errors.

- [ ] **Step 4: Commit**

```bash
git add packages/docs/src/components/demos/ProgressBarDemo.tsx \
        packages/docs/src/content/docs/components/progress-bar.mdx
git commit -m "feat(docs): add ProgressBarDemo and description to progress-bar page"
```

---

## Task 4: `StatusBadgeDemo.tsx` + update `status-badge.mdx`

**Files:**
- Create: `packages/docs/src/components/demos/StatusBadgeDemo.tsx`
- Modify: `packages/docs/src/content/docs/components/status-badge.mdx`

- [ ] **Step 1: Create `StatusBadgeDemo.tsx`**

`FileStatus` has six values: `"selected"`, `"validating"`, `"uploading"`, `"processing"`, `"ready"`, `"failed"`.

```tsx
import { StatusBadge } from "@hyperserve/upload-react";
import type { FileStatus } from "@hyperserve/upload";

const statuses: FileStatus[] = [
	"selected",
	"validating",
	"uploading",
	"processing",
	"ready",
	"failed",
];

export default function StatusBadgeDemo() {
	return (
		<div
			style={{
				alignItems: "center",
				background: "#fff",
				border: "1px solid #e2e8f0",
				borderRadius: 8,
				display: "flex",
				flexWrap: "wrap",
				gap: "0.75rem",
				padding: "1.5rem",
			}}
		>
			{statuses.map((status) => (
				<StatusBadge key={status} status={status} />
			))}
		</div>
	);
}
```

- [ ] **Step 2: Update `status-badge.mdx`**

Add before `## Usage`:

```mdx
---
title: StatusBadge
description: Pill badge displaying the current file status.
---

import StatusBadgeDemo from "../../../components/demos/StatusBadgeDemo";

StatusBadge renders a colored pill label for a `FileStatus`. Override colors and labels per status with `statusConfig`, or drop into headless mode with the `children` render function.

<StatusBadgeDemo client:load />

## Usage
```

- [ ] **Step 3: Build check**

```bash
bun docs:build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add packages/docs/src/components/demos/StatusBadgeDemo.tsx \
        packages/docs/src/content/docs/components/status-badge.mdx
git commit -m "feat(docs): add StatusBadgeDemo and description to status-badge page"
```

---

## Task 5: `ThumbnailDemo.tsx` + update `thumbnail.mdx`

**Files:**
- Create: `packages/docs/src/components/demos/ThumbnailDemo.tsx`
- Modify: `packages/docs/src/content/docs/components/thumbnail.mdx`

- [ ] **Step 1: Create `ThumbnailDemo.tsx`**

Three states: placeholder (no `thumbnailUri`), image (`thumbnailUri` set to an SVG data URI), ready (status `"ready"` but no `playbackUrl` — shows placeholder since `playbackUrl` is null). The SVG data URI is a gray 160×90 rectangle that mimics a video poster frame.

```tsx
import { Thumbnail } from "@hyperserve/upload-react";
import type React from "react";
import { mockFile } from "./mockFileState";

const THUMB_SVG =
	"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='90'%3E%3Crect width='160' height='90' fill='%23cbd5e1'/%3E%3Ctext x='80' y='48' text-anchor='middle' dominant-baseline='middle' fill='%2394a3b8' font-size='11' font-family='sans-serif'%3Evideo.mp4%3C/text%3E%3C/svg%3E";

const cases: { label: string; file: ReturnType<typeof mockFile> }[] = [
	{
		label: "Placeholder",
		file: mockFile({ id: "thumb-1", status: "uploading" }),
	},
	{
		label: "Image",
		file: mockFile({ id: "thumb-2", status: "uploading", thumbnailUri: THUMB_SVG }),
	},
	{
		label: "Ready (no playback URL)",
		file: mockFile({ id: "thumb-3", status: "ready" }),
	},
];

const col: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "0.5rem",
};

const label: React.CSSProperties = {
	color: "#64748b",
	fontSize: "0.75rem",
	fontWeight: 500,
	textAlign: "center",
};

export default function ThumbnailDemo() {
	return (
		<div
			style={{
				background: "#fff",
				border: "1px solid #e2e8f0",
				borderRadius: 8,
				display: "flex",
				flexWrap: "wrap",
				gap: "1.25rem",
				padding: "1.5rem",
			}}
		>
			{cases.map(({ label: l, file }) => (
				<div key={file.id} style={col}>
					<Thumbnail file={file} playback style={{ width: 160 }} />
					<span style={label}>{l}</span>
				</div>
			))}
		</div>
	);
}
```

- [ ] **Step 2: Update `thumbnail.mdx`**

Add before `## Usage`:

```mdx
---
title: Thumbnail
description: Renders a file thumbnail with optional playback mode.
---

import ThumbnailDemo from "../../../components/demos/ThumbnailDemo";

Thumbnail renders a file's visual preview — a browser-generated image thumbnail on web, or a placeholder icon when none is available. Set `playback` to render a `<video>` element when the file status is `"ready"` and a `playbackUrl` exists.

<ThumbnailDemo client:load />

## Usage
```

- [ ] **Step 3: Build check**

```bash
bun docs:build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add packages/docs/src/components/demos/ThumbnailDemo.tsx \
        packages/docs/src/content/docs/components/thumbnail.mdx
git commit -m "feat(docs): add ThumbnailDemo and description to thumbnail page"
```

---

## Task 6: `FileItemDemo.tsx` + update `file-item.mdx`

**Files:**
- Create: `packages/docs/src/components/demos/FileItemDemo.tsx`
- Modify: `packages/docs/src/content/docs/components/file-item.mdx`

- [ ] **Step 1: Create `FileItemDemo.tsx`**

`FileItem` provides its own internal context — no `UploadProvider` needed. Show four states in row layout: uploading (progress 55%), processing (with statusDetail), ready, failed. Each gets a unique `ref.name` to make the demo readable.

```tsx
import { FileItem } from "@hyperserve/upload-react";
import type React from "react";
import { mockFile, mockRef } from "./mockFileState";

const files = [
	mockFile({
		id: "fi-1",
		status: "uploading",
		progress: 55,
		ref: { ...mockRef, name: "vacation-2024.mp4" },
	}),
	mockFile({
		id: "fi-2",
		status: "processing",
		statusDetail: "Transcoding 60%",
		ref: { ...mockRef, name: "interview-raw.mp4" },
	}),
	mockFile({
		id: "fi-3",
		status: "ready",
		playbackUrl: "https://example.com/video.mp4",
		ref: { ...mockRef, name: "product-demo.mp4" },
	}),
	mockFile({
		id: "fi-4",
		status: "failed",
		error: "Upload failed. Check your connection.",
		ref: { ...mockRef, name: "conference-talk.mp4" },
	}),
];

export default function FileItemDemo() {
	return (
		<div
			style={{
				background: "#fff",
				border: "1px solid #e2e8f0",
				borderRadius: 8,
				display: "flex",
				flexDirection: "column",
				gap: "0.75rem",
				padding: "1.5rem",
			}}
		>
			{files.map((file) => (
				<FileItem key={file.id} file={file} layout="row">
					<FileItem.Content />
				</FileItem>
			))}
		</div>
	);
}
```

- [ ] **Step 2: Update `file-item.mdx`**

The final file header (frontmatter + imports + description + demo, before `## Usage`) must look exactly like this:

```mdx
---
title: FileItem
description: Compound component for rendering individual file upload states.
---

import FileItemDemo from "../../../components/demos/FileItemDemo";

FileItem is a compound component that renders a single file's upload state. Compose its named sub-components (`FileItem.FileName`, `FileItem.UploadProgress`, `FileItem.Actions`, etc.) to build custom layouts — or omit `children` entirely to use the built-in `FileItem.Content` default.

<FileItemDemo client:load />
```

Keep everything from `## Usage` onward unchanged. The `ComposableDemo` import and `<ComposableDemo client:load />` are removed.

- [ ] **Step 3: Build check**

```bash
bun docs:build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add packages/docs/src/components/demos/FileItemDemo.tsx \
        packages/docs/src/content/docs/components/file-item.mdx
git commit -m "feat(docs): add FileItemDemo showing all upload states to file-item page"
```

---

## Task 7: `DropZoneDemo.tsx` + update `drop-zone.mdx`

**Files:**
- Create: `packages/docs/src/components/demos/DropZoneDemo.tsx`
- Modify: `packages/docs/src/content/docs/components/drop-zone.mdx`

- [ ] **Step 1: Create `DropZoneDemo.tsx`**

Slim interactive demo: `UploadProvider` with `MockAdapter` wraps just `DropZone`. A small counter below shows files queued via `useUpload()`. No `FileList` so the page stays focused on the drop zone.

```tsx
import { UploadProvider, useUpload } from "@hyperserve/upload";
import { DropZone } from "@hyperserve/upload-react";
import type React from "react";
import { useMemo } from "react";
import { createMockConfig } from "./MockAdapter";

function QueuedCount() {
	const { files } = useUpload();
	if (files.length === 0) return null;
	return (
		<p
			style={{
				color: "#64748b",
				fontSize: "0.875rem",
				margin: 0,
				textAlign: "center",
			}}
		>
			{files.length} file{files.length !== 1 ? "s" : ""} queued
		</p>
	);
}

export default function DropZoneDemo() {
	const config = useMemo(() => createMockConfig(), []);
	return (
		<div
			style={{
				background: "#fff",
				border: "1px solid #e2e8f0",
				borderRadius: 8,
				display: "flex",
				flexDirection: "column",
				gap: "1rem",
				padding: "1.5rem",
			}}
		>
			<UploadProvider config={config}>
				<DropZone supportingText="MP4, WebM, MOV — up to 500 MB" />
				<QueuedCount />
			</UploadProvider>
		</div>
	);
}
```

- [ ] **Step 2: Update `drop-zone.mdx`**

Replace the current `DefaultDemo` import with `DropZoneDemo`, add a description, keep all props/render-function documentation unchanged.

Replace:
```mdx
import DefaultDemo from "../../../components/demos/DefaultDemo";
```
With:
```mdx
import DropZoneDemo from "../../../components/demos/DropZoneDemo";
```

Add a description before `## Usage` and replace `<DefaultDemo client:load />` with `<DropZoneDemo client:load />`:

```mdx
DropZone provides a drag-and-drop target and file-picker button for adding video files. It reads `canAddMore` from `UploadProvider` context and disables itself automatically when the file limit is reached.

<DropZoneDemo client:load />
```

- [ ] **Step 3: Build check**

```bash
bun docs:build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add packages/docs/src/components/demos/DropZoneDemo.tsx \
        packages/docs/src/content/docs/components/drop-zone.mdx
git commit -m "feat(docs): add DropZoneDemo (drop zone only) to drop-zone page"
```

---

## Task 8: `FileListToolbarDemo.tsx` + update `file-list-toolbar.mdx`

**Files:**
- Create: `packages/docs/src/components/demos/FileListToolbarDemo.tsx`
- Modify: `packages/docs/src/content/docs/components/file-list-toolbar.mdx`

- [ ] **Step 1: Create `FileListToolbarDemo.tsx`**

`FileListToolbar.FileCount` reads `files` from `UploadContext`; `FileListToolbar.ViewToggle` reads from `ViewModeProvider`. Both are satisfied by `MockFilesProvider`. The ViewToggle is functional — clicking it updates the ViewModeProvider context.

```tsx
import { FileListToolbar } from "@hyperserve/upload-react";
import type React from "react";
import {
	failedFile,
	processingFile,
	uploadingFile,
} from "./mockFileState";
import { MockFilesProvider } from "./MockFilesProvider";

const mockFiles = [uploadingFile, processingFile, failedFile];

export default function FileListToolbarDemo() {
	return (
		<div
			style={{
				background: "#fff",
				border: "1px solid #e2e8f0",
				borderRadius: 8,
				padding: "1.5rem",
			}}
		>
			<MockFilesProvider files={mockFiles}>
				<FileListToolbar />
			</MockFilesProvider>
		</div>
	);
}
```

- [ ] **Step 2: Update `file-list-toolbar.mdx`**

Add before `## Usage`:

```mdx
---
title: FileListToolbar
description: Toolbar with configurable slots for file count and view toggle.
---

import FileListToolbarDemo from "../../../components/demos/FileListToolbarDemo";

FileListToolbar is a two-slot bar (left and right) for showing file count and a list/grid view toggle. Both slots are fully replaceable — pass `null` to hide a slot or a custom `ReactNode` to override the default sub-component.

<FileListToolbarDemo client:load />

## Usage
```

- [ ] **Step 3: Build check**

```bash
bun docs:build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add packages/docs/src/components/demos/FileListToolbarDemo.tsx \
        packages/docs/src/content/docs/components/file-list-toolbar.mdx
git commit -m "feat(docs): add FileListToolbarDemo and description to file-list-toolbar page"
```

---

## Task 9: `FileListDemo.tsx` + update `file-list.mdx`

**Files:**
- Create: `packages/docs/src/components/demos/FileListDemo.tsx`
- Modify: `packages/docs/src/content/docs/components/file-list.mdx`

- [ ] **Step 1: Create `FileListDemo.tsx`**

Show list and grid modes stacked. Each `FileList` has an explicit `mode` prop which takes precedence over the `ViewModeProvider` context. Four mock files with distinct names so the demo is readable.

```tsx
import { FileList } from "@hyperserve/upload-react";
import type React from "react";
import { mockFile, mockRef } from "./mockFileState";
import { MockFilesProvider } from "./MockFilesProvider";

const mockFiles = [
	mockFile({
		id: "fl-1",
		status: "uploading",
		progress: 55,
		ref: { ...mockRef, name: "vacation-2024.mp4" },
	}),
	mockFile({
		id: "fl-2",
		status: "processing",
		statusDetail: "Transcoding 60%",
		ref: { ...mockRef, name: "interview-raw.mp4" },
	}),
	mockFile({
		id: "fl-3",
		status: "ready",
		playbackUrl: "https://example.com/video.mp4",
		ref: { ...mockRef, name: "product-demo.mp4" },
	}),
	mockFile({
		id: "fl-4",
		status: "failed",
		error: "Upload failed. Check your connection.",
		ref: { ...mockRef, name: "conference-talk.mp4" },
	}),
];

const sectionLabel: React.CSSProperties = {
	color: "#64748b",
	fontSize: "0.75rem",
	fontWeight: 600,
	letterSpacing: "0.05em",
	textTransform: "uppercase",
};

export default function FileListDemo() {
	return (
		<MockFilesProvider files={mockFiles}>
			<div
				style={{
					background: "#fff",
					border: "1px solid #e2e8f0",
					borderRadius: 8,
					display: "flex",
					flexDirection: "column",
					gap: "1.5rem",
					padding: "1.5rem",
				}}
			>
				<div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
					<span style={sectionLabel}>List mode</span>
					<FileList mode="list" />
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
					<span style={sectionLabel}>Grid mode</span>
					<FileList mode="grid" />
				</div>
			</div>
		</MockFilesProvider>
	);
}
```

- [ ] **Step 2: Update `file-list.mdx`**

Add before `## Usage`:

```mdx
---
title: FileList
description: Renders the list of files with support for list and grid view modes.
---

import FileListDemo from "../../../components/demos/FileListDemo";

FileList renders all files in the upload queue in list or grid layout, reading file state from `UploadProvider` context. Pass a render function as `children` to use a custom item renderer — otherwise it renders `FileItem.Content` per file.

<FileListDemo client:load />

## Usage
```

- [ ] **Step 3: Build check**

```bash
bun docs:build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add packages/docs/src/components/demos/FileListDemo.tsx \
        packages/docs/src/content/docs/components/file-list.mdx
git commit -m "feat(docs): add FileListDemo (list + grid) and description to file-list page"
```

---

## Task 10: Add `ComposableDemo` to `quick-start.mdx`

**Files:**
- Modify: `packages/docs/src/content/docs/getting-started/quick-start.mdx`

The current quick-start page shows `DefaultDemo` under `### Result`. Add a second section afterward that shows the composable layout pattern using `ComposableDemo`, which illustrates that FileList accepts a custom render function.

- [ ] **Step 1: Update `quick-start.mdx`**

Two changes to the file:

**1.** Add a second import on the line after the existing `DefaultDemo` import (currently line 6):

    import ComposableDemo from "../../../components/demos/ComposableDemo";

**2.** Insert this new section between the closing paragraph of `## What's happening` and the `## Using a different backend` heading. The `tsx` code block below uses triple backticks; write it that way in the mdx file:

    ## Composable layout

    Pass a render function to `FileList` to take full control of each file card:

    [tsx code block]
    <FileList>
      {(file) => (
        <FileItem file={file} key={file.id} layout="column">
          <Thumbnail file={file} playback />
          <FileItem.FileName />
          <FileItem.Meta>
            <FileItem.FileSize />
            <FileItem.StatusIcon />
          </FileItem.Meta>
          <FileItem.UploadProgress />
          <FileItem.ErrorMessage />
          <FileItem.Actions>
            <FileItem.RemoveButton />
            <FileItem.RetryButton />
          </FileItem.Actions>
        </FileItem>
      )}
    </FileList>
    [end tsx code block]

    <ComposableDemo client:load />

- [ ] **Step 2: Build check**

```bash
bun docs:build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add packages/docs/src/content/docs/getting-started/quick-start.mdx
git commit -m "feat(docs): add composable layout section with ComposableDemo to quick-start"
```

---

## Task 11: Final verification

- [ ] **Step 1: Run full build**

```bash
bun docs:build
```

Expected: exits 0, no type errors, no broken imports.

- [ ] **Step 2: Run lint**

```bash
bun lint:check
```

Expected: no errors. If Biome flags formatting, run `bun lint:fix` and commit the fixes.

- [ ] **Step 3: Smoke-check each page in dev server**

```bash
bun docs:dev
```

Open each page and confirm the demo renders:
- `/components/progress-bar/` — 4 bars at 0/33/67/100%
- `/components/status-badge/` — 6 badges
- `/components/thumbnail/` — 3 thumbnails (placeholder, image, ready placeholder)
- `/components/file-item/` — 4 rows (uploading, processing, ready, failed)
- `/components/drop-zone/` — interactive drop zone, file counter appears on drop
- `/components/file-list-toolbar/` — toolbar with "3 files added" count and functional toggle
- `/components/file-list/` — list and grid sections with 4 files each
- `/getting-started/quick-start/` — DefaultDemo then ComposableDemo

- [ ] **Step 4: Final commit if needed**

If lint fixes were applied:
```bash
git add -A
git commit -m "chore(docs): apply lint/format fixes after demo additions"
```
