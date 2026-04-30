# Component Docs Demo Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every code block on the thumbnail, file-item, and file-list component pages is followed by a rendered demo; all "ready" state mocks show a real thumbnail image and functional video playback.

**Architecture:** Update shared mock constants, update/fix existing demo components, create 7 new focused demo components, and restructure 3 mdx pages to interleave code blocks with their rendered demos.

**Tech Stack:** React, Astro MDX, `@hyperserve/upload-react`, Bun

---

## File Map

| Action | Path |
|--------|------|
| Modify | `packages/docs/src/components/demos/mockFileState.ts` |
| Modify | `packages/docs/src/components/demos/ThumbnailDemo.tsx` |
| Create | `packages/docs/src/components/demos/ThumbnailBasicDemo.tsx` |
| Create | `packages/docs/src/components/demos/ThumbnailPlaybackDemo.tsx` |
| Modify | `packages/docs/src/content/docs/components/thumbnail.mdx` |
| Modify | `packages/docs/src/components/demos/FileItemDemo.tsx` |
| Create | `packages/docs/src/components/demos/FileItemColumnDemo.tsx` |
| Modify | `packages/docs/src/content/docs/components/file-item.mdx` |
| Modify | `packages/docs/src/components/demos/FileListDemo.tsx` |
| Create | `packages/docs/src/components/demos/FileListDefaultDemo.tsx` |
| Create | `packages/docs/src/components/demos/FileListEmptyDemo.tsx` |
| Create | `packages/docs/src/components/demos/FileListGridColumnsDemo.tsx` |
| Create | `packages/docs/src/components/demos/FileListCustomItemDemo.tsx` |
| Modify | `packages/docs/src/content/docs/components/file-list.mdx` |

---

## Task 1: Export shared constants from mockFileState.ts

**Files:**
- Modify: `packages/docs/src/components/demos/mockFileState.ts`

- [ ] **Step 1: Add THUMB_SVG and VIDEO_URL exports**

Open `packages/docs/src/components/demos/mockFileState.ts` and add these two exports after the existing imports, before `mockRef`:

```ts
export const THUMB_SVG =
	"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='90'%3E%3Crect width='160' height='90' fill='%23cbd5e1'/%3E%3Ctext x='80' y='48' text-anchor='middle' dominant-baseline='middle' fill='%2394a3b8' font-size='11' font-family='sans-serif'%3Evideo.mp4%3C/text%3E%3C/svg%3E";

export const VIDEO_URL =
	"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/components/demos/mockFileState.ts
git commit -m "feat(docs): export THUMB_SVG and VIDEO_URL from mockFileState"
```

---

## Task 2: Update ThumbnailDemo to use shared constants and add Playback column

**Files:**
- Modify: `packages/docs/src/components/demos/ThumbnailDemo.tsx`

- [ ] **Step 1: Replace file contents**

Replace the entire file with:

```tsx
import { Thumbnail } from "@hyperserve/upload-react";
import type React from "react";
import { THUMB_SVG, VIDEO_URL, mockFile } from "./mockFileState";

const cases: { label: string; file: ReturnType<typeof mockFile> }[] = [
	{
		file: mockFile({ id: "thumb-1", status: "uploading" }),
		label: "Placeholder",
	},
	{
		file: mockFile({
			id: "thumb-2",
			status: "uploading",
			thumbnailUri: THUMB_SVG,
		}),
		label: "Image",
	},
	{
		file: mockFile({ id: "thumb-3", status: "ready" }),
		label: "Ready (no URL)",
	},
	{
		file: mockFile({
			id: "thumb-4",
			playbackUrl: VIDEO_URL,
			status: "ready",
			thumbnailUri: THUMB_SVG,
		}),
		label: "Playback",
	},
];

const col: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "0.5rem",
};

const labelStyle: React.CSSProperties = {
	color: "#64748b",
	fontSize: "0.75rem",
	fontWeight: 500,
	textAlign: "center",
};

export default function ThumbnailDemo() {
	return (
		<div
			className="not-content"
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
			{cases.map(({ label, file }) => (
				<div key={file.id} style={col}>
					<Thumbnail file={file} playback style={{ width: 160 }} />
					<span style={labelStyle}>{label}</span>
				</div>
			))}
		</div>
	);
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/components/demos/ThumbnailDemo.tsx
git commit -m "feat(docs): add Playback column to ThumbnailDemo, use shared constants"
```

---

## Task 3: Create ThumbnailBasicDemo and ThumbnailPlaybackDemo

**Files:**
- Create: `packages/docs/src/components/demos/ThumbnailBasicDemo.tsx`
- Create: `packages/docs/src/components/demos/ThumbnailPlaybackDemo.tsx`

- [ ] **Step 1: Create ThumbnailBasicDemo.tsx**

```tsx
import { Thumbnail } from "@hyperserve/upload-react";
import type React from "react";
import { THUMB_SVG, mockFile } from "./mockFileState";

const col: React.CSSProperties = {
	display: "flex",
	flexDirection: "column",
	gap: "0.5rem",
};

const labelStyle: React.CSSProperties = {
	color: "#64748b",
	fontSize: "0.75rem",
	fontWeight: 500,
	textAlign: "center",
};

export default function ThumbnailBasicDemo() {
	return (
		<div
			className="not-content"
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
			<div style={col}>
				<Thumbnail
					file={mockFile({ id: "basic-1", thumbnailUri: THUMB_SVG })}
					style={{ width: 160 }}
				/>
				<span style={labelStyle}>With thumbnailUri</span>
			</div>
			<div style={col}>
				<Thumbnail
					file={mockFile({ id: "basic-2" })}
					style={{ width: 160 }}
				/>
				<span style={labelStyle}>Placeholder</span>
			</div>
		</div>
	);
}
```

- [ ] **Step 2: Create ThumbnailPlaybackDemo.tsx**

```tsx
import { Thumbnail } from "@hyperserve/upload-react";
import { THUMB_SVG, VIDEO_URL, mockFile } from "./mockFileState";

export default function ThumbnailPlaybackDemo() {
	return (
		<div
			className="not-content"
			style={{
				background: "#fff",
				border: "1px solid #e2e8f0",
				borderRadius: 8,
				padding: "1.5rem",
			}}
		>
			<Thumbnail
				file={mockFile({
					id: "playback-1",
					playbackUrl: VIDEO_URL,
					status: "ready",
					thumbnailUri: THUMB_SVG,
				})}
				playback
			/>
		</div>
	);
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/docs/src/components/demos/ThumbnailBasicDemo.tsx packages/docs/src/components/demos/ThumbnailPlaybackDemo.tsx
git commit -m "feat(docs): add ThumbnailBasicDemo and ThumbnailPlaybackDemo"
```

---

## Task 4: Update thumbnail.mdx

**Files:**
- Modify: `packages/docs/src/content/docs/components/thumbnail.mdx`

- [ ] **Step 1: Replace file contents**

Replace the entire file with:

```mdx
---
title: Thumbnail
description: Renders a file thumbnail with optional playback mode.
---

import ThumbnailDemo from "../../../components/demos/ThumbnailDemo";
import ThumbnailBasicDemo from "../../../components/demos/ThumbnailBasicDemo";
import ThumbnailPlaybackDemo from "../../../components/demos/ThumbnailPlaybackDemo";

Thumbnail renders a file's visual preview, a browser-generated image thumbnail on web, or a placeholder icon when none is available. Set `playback` to render a `<video>` element when the file status is `"ready"` and a `playbackUrl` exists.

<ThumbnailDemo client:load />

## Usage

```tsx
import { Thumbnail } from "@hyperserve/upload-react";

<Thumbnail file={file} />
```

<ThumbnailBasicDemo client:load />

```tsx
// Renders a <video> element when file.status is "ready" and playbackUrl is set
<Thumbnail file={file} playback />
```

<ThumbnailPlaybackDemo client:load />

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `file` | `FileState` | **required** | The file state object |
| `playback` | `boolean` | `false` | Render a `<video>` element when `file.playbackUrl` is available |
| `controls` | `boolean` | `true` | Show native video controls (only applies in playback mode) |
| `style` | `CSSProperties` | none | Container styles |
| `className` | `string` | none | Container class |
| `placeholderStyle` | `CSSProperties` | none | Styles for the placeholder container |
| `placeholderClassName` | `string` | none | Class for the placeholder container |
| `placeholder` | `ReactNode` | none | Custom placeholder content (replaces the default icon) |
| `children` | `(info) => ReactNode` | none | Render function receiving `{ thumbnailUri, playbackUrl, isReady }` |

## Behavior

- Shows the thumbnail from `file.thumbnailUri` (generated on file add, web only)
- When `playback` is true and the file is `ready`, renders a `<video>` element with the `playbackUrl`
- Shows a placeholder icon when no thumbnail is available
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/content/docs/components/thumbnail.mdx
git commit -m "feat(docs): add inline demos to thumbnail.mdx, expand props table"
```

---

## Task 5: Fix FileItemDemo fi-3

**Files:**
- Modify: `packages/docs/src/components/demos/FileItemDemo.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
import { UploadProvider } from "@hyperserve/upload";
import { FileItem } from "@hyperserve/upload-react";
import { useMemo } from "react";
import { createMockConfig } from "./MockAdapter";
import { THUMB_SVG, VIDEO_URL, mockFile, mockRef } from "./mockFileState";

const files = [
	mockFile({
		id: "fi-1",
		progress: 55,
		ref: { ...mockRef, name: "vacation-2024.mp4" },
		status: "uploading",
	}),
	mockFile({
		id: "fi-2",
		ref: { ...mockRef, name: "interview-raw.mp4" },
		status: "processing",
		statusDetail: "Transcoding 60%",
	}),
	mockFile({
		id: "fi-3",
		playbackUrl: VIDEO_URL,
		ref: { ...mockRef, name: "product-demo.mp4" },
		status: "ready",
		thumbnailUri: THUMB_SVG,
	}),
	mockFile({
		error: "Upload failed. Check your connection.",
		id: "fi-4",
		ref: { ...mockRef, name: "conference-talk.mp4" },
		status: "failed",
	}),
];

export default function FileItemDemo() {
	const config = useMemo(() => createMockConfig(), []);

	return (
		<UploadProvider config={config}>
			<div
				className="not-content"
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
					<FileItem file={file} key={file.id} layout="row">
						<FileItem.Content />
					</FileItem>
				))}
			</div>
		</UploadProvider>
	);
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/components/demos/FileItemDemo.tsx
git commit -m "fix(docs): use real VIDEO_URL and THUMB_SVG for fi-3 in FileItemDemo"
```

---

## Task 6: Create FileItemColumnDemo and update file-item.mdx

**Files:**
- Create: `packages/docs/src/components/demos/FileItemColumnDemo.tsx`
- Modify: `packages/docs/src/content/docs/components/file-item.mdx`

- [ ] **Step 1: Create FileItemColumnDemo.tsx**

```tsx
import { FileItem, Thumbnail } from "@hyperserve/upload-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { THUMB_SVG, VIDEO_URL, mockFile, mockRef } from "./mockFileState";

const file = mockFile({
	id: "fic-1",
	playbackUrl: VIDEO_URL,
	ref: { ...mockRef, name: "product-demo.mp4" },
	status: "ready",
	thumbnailUri: THUMB_SVG,
});

export default function FileItemColumnDemo() {
	return (
		<MockFilesProvider files={[file]}>
			<div
				className="not-content"
				style={{
					background: "#fff",
					border: "1px solid #e2e8f0",
					borderRadius: 8,
					maxWidth: 280,
					padding: "1.5rem",
				}}
			>
				<FileItem file={file} layout="column">
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
			</div>
		</MockFilesProvider>
	);
}
```

- [ ] **Step 2: Update file-item.mdx**

Replace the entire file with:

```mdx
---
title: FileItem
description: Compound component for rendering individual file upload states.
---

import FileItemDemo from "../../../components/demos/FileItemDemo";
import FileItemColumnDemo from "../../../components/demos/FileItemColumnDemo";

FileItem is a compound component that renders a single file's upload state. Compose its named sub-components (`FileItem.FileName`, `FileItem.UploadProgress`, `FileItem.Actions`, etc.) to build custom layouts, or omit `children` entirely to use the built-in `FileItem.Content` default.

<FileItemDemo client:only="react" />

## Usage

`FileItem` is a compound component. Use it with its sub-components to build custom file row/card layouts.

```tsx
import { FileItem, Thumbnail } from "@hyperserve/upload-react";

<FileItem file={file} layout="column">
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
```

<FileItemColumnDemo client:load />

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `file` | `FileState` | **required** | The file state object |
| `layout` | `"row" \| "column"` | `"column"` | Layout direction |
| `style` | `CSSProperties` | none | Container styles |
| `className` | `string` | none | Container class |
| `children` | `ReactNode \| (file) => ReactNode` | none | Sub-components or render function |

## Sub-components

All sub-components read from the parent `FileItem` context. They don't need explicit props.

| Sub-component | Description |
|---------------|-------------|
| `FileItem.FileName` | File name, truncated with ellipsis |
| `FileItem.FileSize` | Human-readable file size |
| `FileItem.ErrorMessage` | Renders `file.error` when present |
| `FileItem.RemoveButton` | Hidden during `processing`/`ready` |
| `FileItem.RetryButton` | Only shown when `failed` |
| `FileItem.StatusIcon` | Spinner during `processing`, check mark when `ready` |
| `FileItem.Meta` | Flex row container for status metadata |
| `FileItem.Actions` | Flex column container for action buttons |
| `FileItem.UploadProgress` | Progress bar, visible only during `uploading` |
| `FileItem.PlaybackPreview` | Thumbnail in playback mode, visible only when `ready` |
| `FileItem.Content` | Opinionated default layout combining all sub-components |

## Default rendering

When `children` is omitted on `FileItem`, it renders `FileItem.Content`, which assembles all sub-components in a sensible default layout that adapts to the `layout` prop.
```

- [ ] **Step 3: Commit**

```bash
git add packages/docs/src/components/demos/FileItemColumnDemo.tsx packages/docs/src/content/docs/components/file-item.mdx
git commit -m "feat(docs): add FileItemColumnDemo inline demo to file-item.mdx"
```

---

## Task 7: Fix FileListDemo fl-3

**Files:**
- Modify: `packages/docs/src/components/demos/FileListDemo.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
import { FileList } from "@hyperserve/upload-react";
import type React from "react";
import { MockFilesProvider } from "./MockFilesProvider";
import { THUMB_SVG, VIDEO_URL, mockFile, mockRef } from "./mockFileState";

const mockFiles = [
	mockFile({
		id: "fl-1",
		progress: 55,
		ref: { ...mockRef, name: "vacation-2024.mp4" },
		status: "uploading",
	}),
	mockFile({
		id: "fl-2",
		ref: { ...mockRef, name: "interview-raw.mp4" },
		status: "processing",
		statusDetail: "Transcoding 60%",
	}),
	mockFile({
		id: "fl-3",
		playbackUrl: VIDEO_URL,
		ref: { ...mockRef, name: "product-demo.mp4" },
		status: "ready",
		thumbnailUri: THUMB_SVG,
	}),
	mockFile({
		error: "Upload failed. Check your connection.",
		id: "fl-4",
		ref: { ...mockRef, name: "conference-talk.mp4" },
		status: "failed",
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
				className="not-content"
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
				<div
					style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
				>
					<span style={sectionLabel}>List mode</span>
					<FileList mode="list" />
				</div>
				<div
					style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
				>
					<span style={sectionLabel}>Grid mode</span>
					<FileList mode="grid" />
				</div>
			</div>
		</MockFilesProvider>
	);
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/components/demos/FileListDemo.tsx
git commit -m "fix(docs): use real VIDEO_URL and THUMB_SVG for fl-3 in FileListDemo"
```

---

## Task 8: Create FileListDefaultDemo, FileListEmptyDemo, FileListGridColumnsDemo

**Files:**
- Create: `packages/docs/src/components/demos/FileListDefaultDemo.tsx`
- Create: `packages/docs/src/components/demos/FileListEmptyDemo.tsx`
- Create: `packages/docs/src/components/demos/FileListGridColumnsDemo.tsx`

- [ ] **Step 1: Create FileListDefaultDemo.tsx**

```tsx
import { FileList } from "@hyperserve/upload-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { THUMB_SVG, VIDEO_URL, mockFile, mockRef } from "./mockFileState";

const mockFiles = [
	mockFile({
		id: "fld-1",
		progress: 55,
		ref: { ...mockRef, name: "vacation-2024.mp4" },
		status: "uploading",
	}),
	mockFile({
		id: "fld-2",
		ref: { ...mockRef, name: "interview-raw.mp4" },
		status: "processing",
		statusDetail: "Transcoding 60%",
	}),
	mockFile({
		id: "fld-3",
		playbackUrl: VIDEO_URL,
		ref: { ...mockRef, name: "product-demo.mp4" },
		status: "ready",
		thumbnailUri: THUMB_SVG,
	}),
	mockFile({
		error: "Upload failed. Check your connection.",
		id: "fld-4",
		ref: { ...mockRef, name: "conference-talk.mp4" },
		status: "failed",
	}),
];

export default function FileListDefaultDemo() {
	return (
		<MockFilesProvider files={mockFiles}>
			<div
				className="not-content"
				style={{
					background: "#fff",
					border: "1px solid #e2e8f0",
					borderRadius: 8,
					padding: "1.5rem",
				}}
			>
				<FileList />
			</div>
		</MockFilesProvider>
	);
}
```

- [ ] **Step 2: Create FileListEmptyDemo.tsx**

```tsx
import { FileList } from "@hyperserve/upload-react";
import { MockFilesProvider } from "./MockFilesProvider";

export default function FileListEmptyDemo() {
	return (
		<MockFilesProvider files={[]}>
			<div
				className="not-content"
				style={{
					background: "#fff",
					border: "1px solid #e2e8f0",
					borderRadius: 8,
					padding: "1.5rem",
				}}
			>
				<FileList emptyMessage="No files selected yet." />
			</div>
		</MockFilesProvider>
	);
}
```

- [ ] **Step 3: Create FileListGridColumnsDemo.tsx**

```tsx
import { FileList } from "@hyperserve/upload-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { THUMB_SVG, VIDEO_URL, mockFile, mockRef } from "./mockFileState";

const mockFiles = [
	mockFile({
		id: "flg-1",
		progress: 55,
		ref: { ...mockRef, name: "vacation-2024.mp4" },
		status: "uploading",
	}),
	mockFile({
		id: "flg-2",
		ref: { ...mockRef, name: "interview-raw.mp4" },
		status: "processing",
		statusDetail: "Transcoding 60%",
	}),
	mockFile({
		id: "flg-3",
		playbackUrl: VIDEO_URL,
		ref: { ...mockRef, name: "product-demo.mp4" },
		status: "ready",
		thumbnailUri: THUMB_SVG,
	}),
	mockFile({
		error: "Upload failed. Check your connection.",
		id: "flg-4",
		ref: { ...mockRef, name: "conference-talk.mp4" },
		status: "failed",
	}),
];

export default function FileListGridColumnsDemo() {
	return (
		<MockFilesProvider files={mockFiles}>
			<div
				className="not-content"
				style={{
					background: "#fff",
					border: "1px solid #e2e8f0",
					borderRadius: 8,
					padding: "1.5rem",
				}}
			>
				<FileList columns="repeat(3, 1fr)" mode="grid" />
			</div>
		</MockFilesProvider>
	);
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/docs/src/components/demos/FileListDefaultDemo.tsx packages/docs/src/components/demos/FileListEmptyDemo.tsx packages/docs/src/components/demos/FileListGridColumnsDemo.tsx
git commit -m "feat(docs): add FileListDefaultDemo, FileListEmptyDemo, FileListGridColumnsDemo"
```

---

## Task 9: Create FileListCustomItemDemo

**Files:**
- Create: `packages/docs/src/components/demos/FileListCustomItemDemo.tsx`

- [ ] **Step 1: Create FileListCustomItemDemo.tsx**

```tsx
import { FileItem, FileList, Thumbnail } from "@hyperserve/upload-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { THUMB_SVG, VIDEO_URL, mockFile, mockRef } from "./mockFileState";

const mockFiles = [
	mockFile({
		id: "flci-1",
		progress: 55,
		ref: { ...mockRef, name: "vacation-2024.mp4" },
		status: "uploading",
	}),
	mockFile({
		id: "flci-2",
		ref: { ...mockRef, name: "interview-raw.mp4" },
		status: "processing",
		statusDetail: "Transcoding 60%",
	}),
	mockFile({
		id: "flci-3",
		playbackUrl: VIDEO_URL,
		ref: { ...mockRef, name: "product-demo.mp4" },
		status: "ready",
		thumbnailUri: THUMB_SVG,
	}),
	mockFile({
		error: "Upload failed. Check your connection.",
		id: "flci-4",
		ref: { ...mockRef, name: "conference-talk.mp4" },
		status: "failed",
	}),
];

export default function FileListCustomItemDemo() {
	return (
		<MockFilesProvider files={mockFiles}>
			<div
				className="not-content"
				style={{
					background: "#fff",
					border: "1px solid #e2e8f0",
					borderRadius: 8,
					padding: "1.5rem",
				}}
			>
				<FileList>
					{(file) => (
						<FileItem key={file.id} file={file} layout="column">
							<Thumbnail file={file} playback />
							<FileItem.FileName />
							<FileItem.UploadProgress />
							<FileItem.Actions>
								<FileItem.RemoveButton />
								<FileItem.RetryButton />
							</FileItem.Actions>
						</FileItem>
					)}
				</FileList>
			</div>
		</MockFilesProvider>
	);
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/components/demos/FileListCustomItemDemo.tsx
git commit -m "feat(docs): add FileListCustomItemDemo"
```

---

## Task 10: Update file-list.mdx

**Files:**
- Modify: `packages/docs/src/content/docs/components/file-list.mdx`

- [ ] **Step 1: Replace file contents**

```mdx
---
title: FileList
description: Renders the list of files with support for list and grid view modes.
---

import FileListDemo from "../../../components/demos/FileListDemo";
import FileListDefaultDemo from "../../../components/demos/FileListDefaultDemo";
import FileListEmptyDemo from "../../../components/demos/FileListEmptyDemo";
import FileListGridColumnsDemo from "../../../components/demos/FileListGridColumnsDemo";
import FileListCustomItemDemo from "../../../components/demos/FileListCustomItemDemo";

FileList renders all files in the upload queue in list or grid layout, reading file state from `UploadProvider` context. Pass a render function as `children` to use a custom item renderer; otherwise it renders `FileItem.Content` per file.

<FileListDemo client:load />

## Usage

```tsx
import { FileList } from "@hyperserve/upload-react";

<FileList />
```

<FileListDefaultDemo client:load />

```tsx
<FileList emptyMessage="No files selected yet." />
```

<FileListEmptyDemo client:load />

```tsx
<FileList mode="grid" columns="repeat(3, 1fr)" />
```

<FileListGridColumnsDemo client:load />

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `"list" \| "grid"` | From `ViewModeProvider` or `"list"` | Layout mode |
| `columns` | `string` | `"repeat(auto-fill, minmax(180px, 1fr))"` | CSS `grid-template-columns` for grid mode |
| `emptyMessage` | `ReactNode` | none | Shown when no files |
| `emptyClassName` | `string` | none | Class for empty state container |
| `emptyStyle` | `CSSProperties` | none | Styles for empty state container |
| `renderEmpty` | `() => ReactNode` | none | Custom empty state renderer (overrides `emptyMessage`) |
| `children` | `(file, index) => ReactNode` | none | Custom item renderer |
| `style` | `CSSProperties` | none | Container styles |
| `className` | `string` | none | Container class |

## Custom item rendering

When `children` is omitted, `FileList` renders a default `FileItem` per file. Provide a render function for custom items:

```tsx
<FileList>
  {(file, index) => (
    <FileItem key={file.id} file={file} layout="column">
      <Thumbnail file={file} playback />
      <FileItem.FileName />
      <FileItem.UploadProgress />
      <FileItem.Actions>
        <FileItem.RemoveButton />
        <FileItem.RetryButton />
      </FileItem.Actions>
    </FileItem>
  )}
</FileList>
```

<FileListCustomItemDemo client:load />

## View mode

`FileList` reads the view mode from `ViewModeProvider` context when available. The `mode` prop always takes precedence over context. Without either, it defaults to `"list"`.
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/content/docs/components/file-list.mdx
git commit -m "feat(docs): add inline demos to file-list.mdx, split usage code blocks"
```
