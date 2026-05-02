# Component Docs Demo Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit and standardize all component and core-concept docs pages so every demo is paired with its exact code (demo → code ordering), redundant demos are removed, and all meaningful code examples have live demos.

**Architecture:** Pure documentation work — 8 new demo `.tsx` files, 2 deleted demo files, 10 updated `.mdx` pages. No logic changes to library code. Each task ends with a commit and leaves the docs site in a working state.

**Tech Stack:** React (demo components), MDX (docs pages), Astro (docs site at `packages/docs`). Dev server: `cd packages/docs && npm run dev`. Demo components live in `packages/docs/src/components/demos/`. Docs pages live in `packages/docs/src/content/docs/`.

**Spec:** `docs/superpowers/specs/2026-05-02-component-docs-demo-audit-design.md`

---

## File Map

**Delete:**
- `packages/docs/src/components/demos/FileListDemo.tsx`
- `packages/docs/src/components/demos/ThumbnailDemo.tsx`

**Create:**
- `packages/docs/src/components/demos/DropZoneRenderFunctionDemo.tsx`
- `packages/docs/src/components/demos/FileListToolbarFileCountDemo.tsx`
- `packages/docs/src/components/demos/FileListToolbarViewToggleDemo.tsx`
- `packages/docs/src/components/demos/ProgressBarStylingDemo.tsx`
- `packages/docs/src/components/demos/StatusBadgeCustomizationDemo.tsx`
- `packages/docs/src/components/demos/StatusBadgeHeadlessDemo.tsx`
- `packages/docs/src/components/demos/ViewModeProviderDemo.tsx`
- `packages/docs/src/components/demos/ViewModeProviderHookDemo.tsx`

**Modify (MDX pages):**
- `packages/docs/src/content/docs/components/file-item.mdx`
- `packages/docs/src/content/docs/components/file-list.mdx`
- `packages/docs/src/content/docs/components/thumbnail.mdx`
- `packages/docs/src/content/docs/components/drop-zone.mdx`
- `packages/docs/src/content/docs/components/file-list-toolbar.mdx`
- `packages/docs/src/content/docs/components/progress-bar.mdx`
- `packages/docs/src/content/docs/components/status-badge.mdx`
- `packages/docs/src/content/docs/components/view-mode-provider.mdx`
- `packages/docs/src/content/docs/core-concepts/theming.mdx`
- `packages/docs/src/content/docs/core-concepts/composable-layout.mdx`

---

## Patterns to follow

Every demo file follows the same shell:
```tsx
export default function XxxDemo() {
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
      {/* component under test */}
    </div>
  );
}
```

`MockFilesProvider` (at `./MockFilesProvider`) wraps both `UploadContext` and `ViewModeProvider` — use it whenever you need upload context or view-mode context without a real adapter. Use `UploadProvider` + `createMockConfig()` (from `./MockAdapter`) when you need an interactive upload (files can be added/removed).

---

## Task 1: Delete redundant demos + update file-list.mdx and thumbnail.mdx

**Files:**
- Delete: `packages/docs/src/components/demos/FileListDemo.tsx`
- Delete: `packages/docs/src/components/demos/ThumbnailDemo.tsx`
- Modify: `packages/docs/src/content/docs/components/file-list.mdx`
- Modify: `packages/docs/src/content/docs/components/thumbnail.mdx`

- [ ] **Step 1: Delete FileListDemo.tsx and ThumbnailDemo.tsx**

```bash
rm packages/docs/src/components/demos/FileListDemo.tsx
rm packages/docs/src/components/demos/ThumbnailDemo.tsx
```

- [ ] **Step 2: Rewrite file-list.mdx**

Replace the full content of `packages/docs/src/content/docs/components/file-list.mdx` with:

```mdx
---
title: FileList
description: Renders the list of files with support for list and grid view modes.
---

import FileListDefaultDemo from "../../../components/demos/FileListDefaultDemo";
import FileListEmptyDemo from "../../../components/demos/FileListEmptyDemo";
import FileListGridColumnsDemo from "../../../components/demos/FileListGridColumnsDemo";
import FileListCustomItemDemo from "../../../components/demos/FileListCustomItemDemo";

FileList renders all files in the upload queue in list or grid layout, reading file state from `UploadProvider` context. Pass a render function as `children` to use a custom item renderer; otherwise it renders `FileItem.Content` per file.

<FileListDefaultDemo client:load />

```tsx
import { FileList } from "@hyperserve/upload-react";

<FileList />
```

<FileListEmptyDemo client:load />

```tsx
<FileList emptyMessage="No files selected yet." />
```

<FileListGridColumnsDemo client:load />

```tsx
<FileList mode="grid" columns="repeat(3, 1fr)" />
```

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

<FileListCustomItemDemo client:load />

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

## View mode

`FileList` reads the view mode from `ViewModeProvider` context when available. The `mode` prop always takes precedence over context. Without either, it defaults to `"list"`.
```

- [ ] **Step 3: Rewrite thumbnail.mdx**

Replace the full content of `packages/docs/src/content/docs/components/thumbnail.mdx` with:

```mdx
---
title: Thumbnail
description: Renders a file thumbnail with optional playback mode.
---

import ThumbnailBasicDemo from "../../../components/demos/ThumbnailBasicDemo";
import ThumbnailPlaybackDemo from "../../../components/demos/ThumbnailPlaybackDemo";

Thumbnail renders a file's visual preview, a browser-generated image thumbnail on web, or a placeholder icon when none is available. Set `playback` to render a `<video>` element when the file status is `"ready"` and a `playbackUrl` exists.

<ThumbnailBasicDemo client:load />

```tsx
import { Thumbnail } from "@hyperserve/upload-react";

<Thumbnail file={file} />
```

<ThumbnailPlaybackDemo client:load />

```tsx
// Renders a <video> element when file.status is "ready" and playbackUrl is set
<Thumbnail file={file} playback />
```

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

- [ ] **Step 4: Verify in the browser**

Run the dev server if not already running:
```bash
cd packages/docs && npm run dev
```

Open the FileList page and Thumbnail page. Confirm:
- FileList: hero shows default list, empty demo shows empty state message, grid demo shows 3-column grid, custom item demo shows column cards
- Thumbnail: hero shows basic thumbnail states, playback demo shows video player
- No console errors about missing imports

- [ ] **Step 5: Commit**

```bash
git add packages/docs/src/components/demos/FileListDemo.tsx packages/docs/src/components/demos/ThumbnailDemo.tsx packages/docs/src/content/docs/components/file-list.mdx packages/docs/src/content/docs/components/thumbnail.mdx
git commit -m "docs(demos): remove redundant FileListDemo and ThumbnailDemo, fix file-list and thumbnail pages"
```

(Note: the `git add` on deleted files stages their removal.)

---

## Task 2: Update file-item.mdx

**Files:**
- Modify: `packages/docs/src/content/docs/components/file-item.mdx`

- [ ] **Step 1: Rewrite file-item.mdx**

Replace the full content of `packages/docs/src/content/docs/components/file-item.mdx` with:

```mdx
---
title: FileItem
description: Compound component for rendering individual file upload states.
---

import FileItemDemo from "../../../components/demos/FileItemDemo";
import FileItemColumnDemo from "../../../components/demos/FileItemColumnDemo";

FileItem is a compound component that renders a single file's upload state. Compose its named sub-components (`FileItem.FileName`, `FileItem.UploadProgress`, `FileItem.Actions`, etc.) to build custom layouts, or omit `children` entirely to use the built-in `FileItem.Content` default.

<FileItemDemo client:only="react" />

```tsx
import { FileItem } from "@hyperserve/upload-react";

<FileItem file={file} layout="row" />
```

## Usage

`FileItem` is a compound component. Use it with its sub-components to build custom file row/card layouts.

<FileItemColumnDemo client:load />

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

- [ ] **Step 2: Verify in browser**

Open the FileItem page. Confirm:
- Hero shows all file states in a row layout, followed immediately by the `<FileItem file={file} layout="row" />` code block
- Usage section starts with the column layout demo, then the compound composition code below it
- No console errors

- [ ] **Step 3: Commit**

```bash
git add packages/docs/src/content/docs/components/file-item.mdx
git commit -m "docs(demos): add hero code to file-item, flip usage section to demo→code"
```

---

## Task 3: Create DropZoneRenderFunctionDemo + update drop-zone.mdx

**Files:**
- Create: `packages/docs/src/components/demos/DropZoneRenderFunctionDemo.tsx`
- Modify: `packages/docs/src/content/docs/components/drop-zone.mdx`

- [ ] **Step 1: Create DropZoneRenderFunctionDemo.tsx**

Create `packages/docs/src/components/demos/DropZoneRenderFunctionDemo.tsx`:

```tsx
import { UploadProvider } from "@hyperserve/upload";
import { DropZone } from "@hyperserve/upload-react";
import { useMemo } from "react";
import { createMockConfig } from "./MockAdapter";

export default function DropZoneRenderFunctionDemo() {
	const config = useMemo(() => createMockConfig(), []);
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
			<UploadProvider config={config}>
				<DropZone>
					{({ isDragging, openPicker }) => (
						<div
							style={{
								alignItems: "center",
								display: "flex",
								flexDirection: "column",
								gap: "0.75rem",
								padding: "1rem",
								textAlign: "center",
							}}
						>
							<span style={{ color: "#64748b", fontSize: "0.875rem" }}>
								{isDragging ? "Release to upload" : "Custom drop zone UI"}
							</span>
							<button
								onClick={openPicker}
								style={{
									background: "#f8fafc",
									border: "1px solid #e2e8f0",
									borderRadius: 6,
									cursor: "pointer",
									fontSize: "0.875rem",
									padding: "0.375rem 0.75rem",
								}}
								type="button"
							>
								Select Files
							</button>
						</div>
					)}
				</DropZone>
			</UploadProvider>
		</div>
	);
}
```

- [ ] **Step 2: Rewrite drop-zone.mdx**

Replace the full content of `packages/docs/src/content/docs/components/drop-zone.mdx` with:

```mdx
---
title: DropZone
description: Drag-and-drop and file picker component for adding files.
---

import DropZoneDemo from "../../../components/demos/DropZoneDemo";
import DropZoneRenderFunctionDemo from "../../../components/demos/DropZoneRenderFunctionDemo";

DropZone provides a drag-and-drop target and file-picker button for adding video files. It reads `canAddMore` from `UploadProvider` context and disables itself automatically when the file limit is reached.

<DropZoneDemo client:load />

```tsx
import { DropZone } from "@hyperserve/upload-react";

<DropZone supportingText="MP4, WebM, MOV, up to 500 MB" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accept` | `string` | `"video/*"` | MIME type filter for the file input |
| `multiple` | `boolean` | `true` | Allow multiple files |
| `disabled` | `boolean` | `false` | Disable the drop zone (also disables when `canAddMore` is false) |
| `supportingText` | `ReactNode` | none | Help text below the main label |
| `style` | `CSSProperties` | none | Base styles |
| `activeStyle` | `CSSProperties` | none | Merged during drag hover |
| `className` | `string` | none | Base class |
| `activeClassName` | `string` | none | Appended during drag hover |
| `children` | `ReactNode \| ((state: DropZoneRenderProps) => ReactNode)` | none | Custom content or render function |

## Render function

For full control over the drop zone content:

<DropZoneRenderFunctionDemo client:load />

```tsx
<DropZone>
  {({ isDragging, openPicker }) => (
    <div>
      {isDragging ? "Release to upload" : "Custom drop zone UI"}
      <button onClick={openPicker}>Select Files</button>
    </div>
  )}
</DropZone>
```

### `DropZoneRenderProps`

```typescript
import type { DropZoneRenderProps } from "@hyperserve/upload-react";

type DropZoneRenderProps = {
  isDragging: boolean;
  openPicker: () => void;
};
```

## Styling

The default drop zone uses inline styles from the shared theme. Override with `style`/`className` or use the render function for complete control.
```

- [ ] **Step 3: Verify in browser**

Open the DropZone page. Confirm:
- Hero shows the default drop zone with supporting text, then its code block below
- Render function section shows the custom drop zone demo (with "Custom drop zone UI" text and Select Files button), then the code block below it
- `DropZoneRenderProps` type block renders as a code block with no demo above it

- [ ] **Step 4: Commit**

```bash
git add packages/docs/src/components/demos/DropZoneRenderFunctionDemo.tsx packages/docs/src/content/docs/components/drop-zone.mdx
git commit -m "docs(demos): add DropZoneRenderFunctionDemo, update drop-zone page to demo→code"
```

---

## Task 4: Create ProgressBarStylingDemo + update progress-bar.mdx

**Files:**
- Create: `packages/docs/src/components/demos/ProgressBarStylingDemo.tsx`
- Modify: `packages/docs/src/content/docs/components/progress-bar.mdx`

- [ ] **Step 1: Create ProgressBarStylingDemo.tsx**

Create `packages/docs/src/components/demos/ProgressBarStylingDemo.tsx`:

```tsx
import { ProgressBar } from "@hyperserve/upload-react";

export default function ProgressBarStylingDemo() {
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
			<ProgressBar
				progress={75}
				trackStyle={{ borderRadius: 4, height: 8 }}
				fillStyle={{ background: "linear-gradient(90deg, #06b6d4, #3b82f6)" }}
			/>
		</div>
	);
}
```

- [ ] **Step 2: Rewrite progress-bar.mdx**

Replace the full content of `packages/docs/src/content/docs/components/progress-bar.mdx` with:

```mdx
---
title: ProgressBar
description: Standalone progress track and fill component.
---

import ProgressBarDemo from "../../../components/demos/ProgressBarDemo";
import ProgressBarStylingDemo from "../../../components/demos/ProgressBarStylingDemo";

ProgressBar renders a track-and-fill progress indicator. It accepts `progress` (0–100) and optional style props for both the track and fill elements independently.

<ProgressBarDemo client:load />

```tsx
import { ProgressBar } from "@hyperserve/upload-react";

<ProgressBar progress={75} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `progress` | `number` | **required** | 0–100 |
| `trackStyle` | `CSSProperties` | none | Styles for the track element |
| `fillStyle` | `CSSProperties` | none | Styles for the fill element |
| `trackClassName` | `string` | none | Class for the track |
| `fillClassName` | `string` | none | Class for the fill |

## Styling

The track and fill are separate elements, each accepting their own style and className props:

<ProgressBarStylingDemo client:load />

```tsx
<ProgressBar
  progress={75}
  trackStyle={{ height: 8, borderRadius: 4 }}
  fillStyle={{ background: "linear-gradient(90deg, #06b6d4, #3b82f6)" }}
/>
```
```

- [ ] **Step 3: Verify in browser**

Open the ProgressBar page. Confirm:
- Hero shows 4 progress values (0%, 33%, 67%, 100%), then code `<ProgressBar progress={75} />` below
- Styling section shows a taller gradient bar at 75%, then the styling code block below it

- [ ] **Step 4: Commit**

```bash
git add packages/docs/src/components/demos/ProgressBarStylingDemo.tsx packages/docs/src/content/docs/components/progress-bar.mdx
git commit -m "docs(demos): add ProgressBarStylingDemo, update progress-bar page to demo→code"
```

---

## Task 5: Create StatusBadgeCustomizationDemo + StatusBadgeHeadlessDemo + update status-badge.mdx

**Files:**
- Create: `packages/docs/src/components/demos/StatusBadgeCustomizationDemo.tsx`
- Create: `packages/docs/src/components/demos/StatusBadgeHeadlessDemo.tsx`
- Modify: `packages/docs/src/content/docs/components/status-badge.mdx`

- [ ] **Step 1: Create StatusBadgeCustomizationDemo.tsx**

Create `packages/docs/src/components/demos/StatusBadgeCustomizationDemo.tsx`:

```tsx
import { StatusBadge } from "@hyperserve/upload-react";

const statusConfig = {
	ready: { bg: "#dbeafe", text: "#1d4ed8", label: "Complete" },
	failed: { bg: "#fee2e2", text: "#dc2626", label: "Error" },
};

export default function StatusBadgeCustomizationDemo() {
	return (
		<div
			className="not-content"
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
			<StatusBadge status="uploading" statusConfig={statusConfig} />
			<StatusBadge status="processing" statusConfig={statusConfig} />
			<StatusBadge status="ready" statusConfig={statusConfig} />
			<StatusBadge status="failed" statusConfig={statusConfig} />
		</div>
	);
}
```

- [ ] **Step 2: Create StatusBadgeHeadlessDemo.tsx**

Create `packages/docs/src/components/demos/StatusBadgeHeadlessDemo.tsx`:

```tsx
import type { FileStatus } from "@hyperserve/upload";
import { StatusBadge } from "@hyperserve/upload-react";

const statuses: FileStatus[] = [
	"selected",
	"uploading",
	"processing",
	"ready",
	"failed",
];

export default function StatusBadgeHeadlessDemo() {
	return (
		<div
			className="not-content"
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
				<StatusBadge key={status} status={status}>
					{({ label, color }) => (
						<span style={{ color, fontWeight: 600 }}>{label}</span>
					)}
				</StatusBadge>
			))}
		</div>
	);
}
```

- [ ] **Step 3: Rewrite status-badge.mdx**

Replace the full content of `packages/docs/src/content/docs/components/status-badge.mdx` with:

```mdx
---
title: StatusBadge
description: Pill badge displaying the current file status.
---

import StatusBadgeDemo from "../../../components/demos/StatusBadgeDemo";
import StatusBadgeCustomizationDemo from "../../../components/demos/StatusBadgeCustomizationDemo";
import StatusBadgeHeadlessDemo from "../../../components/demos/StatusBadgeHeadlessDemo";

StatusBadge renders a colored pill label for a `FileStatus`. Override colors and labels per status with `statusConfig`, or drop into headless mode with the `children` render function.

<StatusBadgeDemo client:load />

```tsx
import { StatusBadge } from "@hyperserve/upload-react";

<StatusBadge status={file.status} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `FileStatus` | **required** | The file status |
| `statusConfig` | `Partial<Record<FileStatus, StatusConfigEntry>>` | none | Per-status overrides for colors/labels |
| `getLabel` | `(status: FileStatus) => string` | none | Custom label function |
| `children` | `(info) => ReactNode` | none | Headless render function |
| `style` | `CSSProperties` | none | Container styles |
| `className` | `string` | none | Container class |

## Customization

Override colors and labels per status. Only the statuses you specify are changed — the rest use their defaults:

<StatusBadgeCustomizationDemo client:load />

```tsx
const statusConfig = {
  ready: { bg: "#dbeafe", text: "#1d4ed8", label: "Complete" },
  failed: { bg: "#fee2e2", text: "#dc2626", label: "Error" },
};

<StatusBadge status="uploading" statusConfig={statusConfig} />
<StatusBadge status="processing" statusConfig={statusConfig} />
<StatusBadge status="ready" statusConfig={statusConfig} />
<StatusBadge status="failed" statusConfig={statusConfig} />
```

## Headless mode

Use the `children` render function for complete control:

<StatusBadgeHeadlessDemo client:load />

```tsx
<StatusBadge status={file.status}>
  {({ label, color }) => (
    <span style={{ color, fontWeight: 600 }}>{label}</span>
  )}
</StatusBadge>
```
```

- [ ] **Step 4: Verify in browser**

Open the StatusBadge page. Confirm:
- Hero shows all 6 status pills, then code below
- Customization section shows 4 badges where `ready` says "Complete" and `failed` says "Error" while `uploading`/`processing` remain default, then code below
- Headless section shows status labels rendered as plain bold colored text (no pill background), then code below

- [ ] **Step 5: Commit**

```bash
git add packages/docs/src/components/demos/StatusBadgeCustomizationDemo.tsx packages/docs/src/components/demos/StatusBadgeHeadlessDemo.tsx packages/docs/src/content/docs/components/status-badge.mdx
git commit -m "docs(demos): add StatusBadge customization and headless demos, update status-badge page to demo→code"
```

---

## Task 6: Create FileListToolbar demos + update file-list-toolbar.mdx

**Files:**
- Create: `packages/docs/src/components/demos/FileListToolbarFileCountDemo.tsx`
- Create: `packages/docs/src/components/demos/FileListToolbarViewToggleDemo.tsx`
- Modify: `packages/docs/src/content/docs/components/file-list-toolbar.mdx`

- [ ] **Step 1: Create FileListToolbarFileCountDemo.tsx**

Create `packages/docs/src/components/demos/FileListToolbarFileCountDemo.tsx`:

```tsx
import { FileListToolbar } from "@hyperserve/upload-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { mockFileList } from "./mockFileState";

export default function FileListToolbarFileCountDemo() {
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
			<MockFilesProvider files={mockFileList}>
				<FileListToolbar
					left={
						<FileListToolbar.FileCount
							label={(count) => `${count} video${count !== 1 ? "s" : ""}`}
						/>
					}
				/>
			</MockFilesProvider>
		</div>
	);
}
```

- [ ] **Step 2: Create FileListToolbarViewToggleDemo.tsx**

Create `packages/docs/src/components/demos/FileListToolbarViewToggleDemo.tsx`:

```tsx
import { FileListToolbar } from "@hyperserve/upload-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { mockFileList } from "./mockFileState";

export default function FileListToolbarViewToggleDemo() {
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
			<MockFilesProvider files={mockFileList}>
				<FileListToolbar.ViewToggle>
					{({ viewMode, setViewMode }) => (
						<select
							onChange={(e) =>
								setViewMode(e.target.value as "list" | "grid")
							}
							style={{ fontSize: "0.875rem" }}
							value={viewMode}
						>
							<option value="list">List</option>
							<option value="grid">Grid</option>
						</select>
					)}
				</FileListToolbar.ViewToggle>
			</MockFilesProvider>
		</div>
	);
}
```

- [ ] **Step 3: Rewrite file-list-toolbar.mdx**

Replace the full content of `packages/docs/src/content/docs/components/file-list-toolbar.mdx` with:

```mdx
---
title: FileListToolbar
description: Toolbar with configurable slots for file count and view toggle.
---

import FileListToolbarDemo from "../../../components/demos/FileListToolbarDemo";
import FileListToolbarFileCountDemo from "../../../components/demos/FileListToolbarFileCountDemo";
import FileListToolbarViewToggleDemo from "../../../components/demos/FileListToolbarViewToggleDemo";

FileListToolbar is a two-slot bar (left and right) for showing file count and a list/grid view toggle. Both slots are fully replaceable: pass `null` to hide a slot or a custom `ReactNode` to override the default sub-component.

<FileListToolbarDemo client:load />

```tsx
import { FileListToolbar } from "@hyperserve/upload-react";

<FileListToolbar />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `left` | `ReactNode \| null` | `FileCount` | Left slot content |
| `right` | `ReactNode \| null` | `ViewToggle` | Right slot content |
| `showFileCount` | `boolean` | `true` | Show default file count in left slot |
| `showViewToggle` | `boolean` | `true` | Show default view toggle in right slot |
| `style` | `CSSProperties` | none | Container styles |
| `className` | `string` | none | Container class |

## Sub-components

### FileListToolbar.FileCount

Shows `"N files added"` by default. Accepts a `label` render prop:

<FileListToolbarFileCountDemo client:load />

```tsx
<FileListToolbar
  left={
    <FileListToolbar.FileCount
      label={(count) => `${count} video${count !== 1 ? "s" : ""}`}
    />
  }
/>
```

### FileListToolbar.ViewToggle

List/grid toggle buttons. Requires a `ViewModeProvider` ancestor. Accepts a `children` render prop for custom toggle UI:

<FileListToolbarViewToggleDemo client:load />

```tsx
<FileListToolbar.ViewToggle>
  {({ viewMode, setViewMode }) => (
    <select
      value={viewMode}
      onChange={(e) => setViewMode(e.target.value as "list" | "grid")}
    >
      <option value="list">List</option>
      <option value="grid">Grid</option>
    </select>
  )}
</FileListToolbar.ViewToggle>
```
```

- [ ] **Step 4: Verify in browser**

Open the FileListToolbar page. Confirm:
- Hero shows the default toolbar (file count left, list/grid buttons right), then code below
- FileCount section shows "4 videos" (not "4 files added"), then code below
- ViewToggle section shows a `<select>` dropdown with List/Grid options, then code below

- [ ] **Step 5: Commit**

```bash
git add packages/docs/src/components/demos/FileListToolbarFileCountDemo.tsx packages/docs/src/components/demos/FileListToolbarViewToggleDemo.tsx packages/docs/src/content/docs/components/file-list-toolbar.mdx
git commit -m "docs(demos): add FileListToolbar sub-component demos, update file-list-toolbar page to demo→code"
```

---

## Task 7: Create ViewModeProvider demos + update view-mode-provider.mdx

**Files:**
- Create: `packages/docs/src/components/demos/ViewModeProviderDemo.tsx`
- Create: `packages/docs/src/components/demos/ViewModeProviderHookDemo.tsx`
- Modify: `packages/docs/src/content/docs/components/view-mode-provider.mdx`

- [ ] **Step 1: Create ViewModeProviderDemo.tsx**

`MockFilesProvider` already includes `ViewModeProvider` internally, so no extra wrapping is needed. This demo shows the toolbar toggle switching `FileList` between list and grid views.

Create `packages/docs/src/components/demos/ViewModeProviderDemo.tsx`:

```tsx
import { FileList, FileListToolbar } from "@hyperserve/upload-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { mockFileList } from "./mockFileState";

export default function ViewModeProviderDemo() {
	return (
		<div
			className="not-content"
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
			<MockFilesProvider files={mockFileList}>
				<FileListToolbar />
				<FileList />
			</MockFilesProvider>
		</div>
	);
}
```

- [ ] **Step 2: Create ViewModeProviderHookDemo.tsx**

Create `packages/docs/src/components/demos/ViewModeProviderHookDemo.tsx`:

```tsx
import { FileList, useViewMode } from "@hyperserve/upload-react";
import { MockFilesProvider } from "./MockFilesProvider";
import { mockFileList } from "./mockFileState";

function MyViewToggle() {
	const { viewMode, setViewMode } = useViewMode();
	return (
		<button
			onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
			style={{
				background: "#f8fafc",
				border: "1px solid #e2e8f0",
				borderRadius: 6,
				cursor: "pointer",
				fontSize: "0.875rem",
				padding: "0.375rem 0.75rem",
			}}
			type="button"
		>
			{viewMode === "list" ? "Switch to grid" : "Switch to list"}
		</button>
	);
}

export default function ViewModeProviderHookDemo() {
	return (
		<div
			className="not-content"
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
			<MockFilesProvider files={mockFileList}>
				<MyViewToggle />
				<FileList />
			</MockFilesProvider>
		</div>
	);
}
```

- [ ] **Step 3: Rewrite view-mode-provider.mdx**

Replace the full content of `packages/docs/src/content/docs/components/view-mode-provider.mdx` with:

```mdx
---
title: ViewModeProvider
description: Context provider for list/grid view mode state used by FileList and FileListToolbar.
---

import ViewModeProviderDemo from "../../../components/demos/ViewModeProviderDemo";
import ViewModeProviderHookDemo from "../../../components/demos/ViewModeProviderHookDemo";

`ViewModeProvider` holds the current view mode (`"list"` or `"grid"`) and makes it available to `FileList` and `FileListToolbar.ViewToggle`. Wrap your upload UI in it when you want view switching, it's optional if you're using `FileList` in a fixed mode.

<ViewModeProviderDemo client:load />

```tsx
import { ViewModeProvider } from "@hyperserve/upload-react";
import { UploadProvider } from "@hyperserve/upload";

function App() {
  return (
    <UploadProvider config={config}>
      <ViewModeProvider>
        <DropZone />
        <FileListToolbar />
        <FileList />
      </ViewModeProvider>
    </UploadProvider>
  );
}
```

`ViewModeProvider` must be a descendant of `UploadProvider`. On web, it also wraps its children in a `flex column` layout with a `1rem` gap, useful for the standard vertical stack layout.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **required** | |
| `defaultMode` | `"list" \| "grid"` | `"list"` | Initial view mode |
| `style` | `CSSProperties` | none | Styles for the layout wrapper. Web only. See [React Native](#react-native). |
| `className` | `string` | none | Class for the layout wrapper. Web only. See [React Native](#react-native). |

## useViewMode

Access and update view mode from any component inside a `ViewModeProvider`:

<ViewModeProviderHookDemo client:load />

```tsx
import { useViewMode } from "@hyperserve/upload-react";

function MyViewToggle() {
  const { viewMode, setViewMode } = useViewMode();
  return (
    <button onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}>
      {viewMode === "list" ? "Switch to grid" : "Switch to list"}
    </button>
  );
}
```

`useViewMode` returns `{ viewMode: "list", setViewMode: () => {} }` as a safe fallback outside a provider, so components using it don't throw.

## React Native

On React Native, `ViewModeProvider` is a pure context provider; it renders no layout wrapper. This is intentional: React Native views already default to `flexDirection: "column"`, so children stack vertically without any wrapping element. Because there's no wrapper, there's nothing to apply `style` or `className` to. To style the container, wrap `ViewModeProvider` in your own `<View>`.

```tsx
import { ViewModeProvider } from "@hyperserve/upload-react-native";

<View style={{ gap: 12 }}>
  <ViewModeProvider>
    <FileListToolbar />
    <FileList />
  </ViewModeProvider>
</View>
```
```

- [ ] **Step 4: Verify in browser**

Open the ViewModeProvider page. Confirm:
- Hero shows a toolbar (with list/grid toggle buttons) and a file list below it. Clicking the toggle switches between list and grid layouts. Code follows the demo.
- `useViewMode` section shows a "Switch to grid" button above a file list. Clicking the button toggles the view and updates the button label. Code follows the demo.
- React Native section renders as a code block with no demo above it.

- [ ] **Step 5: Commit**

```bash
git add packages/docs/src/components/demos/ViewModeProviderDemo.tsx packages/docs/src/components/demos/ViewModeProviderHookDemo.tsx packages/docs/src/content/docs/components/view-mode-provider.mdx
git commit -m "docs(demos): add ViewModeProvider demos, update view-mode-provider page to demo→code"
```

---

## Task 8: Flip ordering in theming.mdx

**Files:**
- Modify: `packages/docs/src/content/docs/core-concepts/theming.mdx`

The three demos (`ThemingStatusConfigDemo`, `ThemingFileItemDemo`, `ThemingDropZoneDemo`) are already imported and rendered, but follow code → demo ordering. The `## Complete example` section already has the correct demo → code ordering and needs no change.

- [ ] **Step 1: Rewrite theming.mdx**

Replace the full content of `packages/docs/src/content/docs/core-concepts/theming.mdx` with:

```mdx
---
title: Theming
description: How the style system works across UI packages — tokens, style props, and status appearance.
---

import { LinkCard } from "@astrojs/starlight/components";
import ThemingStatusConfigDemo from "../../../components/demos/ThemingStatusConfigDemo";
import ThemingFileItemDemo from "../../../components/demos/ThemingFileItemDemo";
import ThemingDropZoneDemo from "../../../components/demos/ThemingDropZoneDemo";
import ThemedDemo from "../../../components/demos/ThemedDemo";

All components are unstyled by default beyond functional defaults, and accept `style`, `className`, and per-sub-component style props. This means you can restyle anything without forking or replacing components.

## Theme tokens

The core package exports design tokens consumed by both UI packages:

```typescript
import {
  themeColors,        // accent, error, border, bg variants, etc.
  themeRadius,        // sm, md, lg, xl, pill
  themeFontScale,     // xs, sm, md, lg, xl (pixel values)
  themeSpacingScale,  // xxs, xs, sm, … cardX, cardY, dropZone, etc.
} from "@hyperserve/upload";
```

These are plain objects — use them in inline styles, CSS-in-JS, or when building your own components alongside the library.

## Status config

`statusConfig` maps every `FileStatus` to a background color, text color, and label:

```typescript
import { statusConfig } from "@hyperserve/upload";

// statusConfig.uploading = { bg: "#eff6ff", text: "#2563eb", label: "Uploading" }
// statusConfig.failed    = { bg: "#fef2f2", text: "#dc2626", label: "Failed" }
// ...
```

Components like `StatusBadge` accept a `statusConfig` prop to override per-status values:

<ThemingStatusConfigDemo client:load />

```tsx
const statusConfig = {
  ready: { bg: "#dbeafe", text: "#1d4ed8", label: "Complete" },
  failed: { bg: "#fee2e2", text: "#dc2626", label: "Error" },
};

// Pass statusConfig to any StatusBadge — only overridden statuses change
<StatusBadge status="uploading" statusConfig={statusConfig} />
<StatusBadge status="ready" statusConfig={statusConfig} />
<StatusBadge status="failed" statusConfig={statusConfig} />
```

## Style props

All UI components accept `style` and `className`. Compound components like `FileItem` expose per-sub-component props so you can restyle individual elements without rebuilding the layout:

<ThemingFileItemDemo client:load />

```tsx
<FileItem file={file} style={{ background: "#1e293b", border: "1px solid #334155" }}>
  <FileItem.FileName style={{ color: "#f1f5f9" }} />
  <FileItem.FileSize style={{ color: "#64748b" }} />
  <FileItem.StatusIcon style={{ color: "#818cf8" }} />
  <FileItem.UploadProgress
    fillStyle={{ background: "linear-gradient(90deg, #818cf8, #a78bfa)" }}
  />
  <FileItem.ErrorMessage style={{ color: "#f87171" }} />
</FileItem>
```

`DropZone` also accepts `activeStyle` for the drag-active state:

<ThemingDropZoneDemo client:load />

```tsx
<DropZone
  style={{ background: "#1e293b", border: "1px dashed #334155" }}
  activeStyle={{ background: "#1e1b4b", borderColor: "#818cf8" }}
/>
```

## Complete example

The demo below applies a dark slate theme entirely through style props — combining `DropZone`, `FileList`, and `FileItem` in one cohesive theme:

<ThemedDemo client:load />

```tsx
<DropZone
  style={{ background: "#1e293b", border: "1px dashed #334155", borderRadius: 8 }}
  activeStyle={{ background: "#1e1b4b", borderColor: "#818cf8", borderStyle: "solid" }}
>
  {({ isDragging, openPicker }) => (
    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", padding: "1rem" }}>
      <span style={{ color: isDragging ? "#a5b4fc" : "#94a3b8", fontSize: "0.875rem" }}>
        {isDragging ? "Release to add" : "Drag videos here or "}
      </span>
      {!isDragging && (
        <button onClick={openPicker} style={{ border: "1px solid #4f46e5", borderRadius: 5, color: "#818cf8" }}>
          browse
        </button>
      )}
    </div>
  )}
</DropZone>

<FileList>
  {(file) => (
    <FileItem
      file={file}
      key={file.id}
      layout="column"
      style={{ background: "#1e293b", border: "1px solid #334155" }}
    >
      <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
        <FileItem.FileName style={{ color: "#f1f5f9" }} />
        <FileItem.RemoveButton style={{ color: "#64748b" }} />
      </div>
      <FileItem.Meta>
        <FileItem.FileSize style={{ color: "#64748b" }} />
        <FileItem.StatusIcon style={{ color: "#818cf8" }} />
      </FileItem.Meta>
      <FileItem.UploadProgress
        fillStyle={{ background: "linear-gradient(90deg, #818cf8, #a78bfa)" }}
      />
      <FileItem.ErrorMessage style={{ color: "#f87171" }} />
      <FileItem.RetryButton style={{ color: "#fb923c" }} />
    </FileItem>
  )}
</FileList>
```
```

- [ ] **Step 2: Verify in browser**

Open the Theming page. Confirm:
- `## Status config` section: import code block, then `ThemingStatusConfigDemo` (badges), then the statusConfig code block
- `## Style props` section: `ThemingFileItemDemo` (dark file rows) then code, then `ThemingDropZoneDemo` (dark drop zone) then code
- `## Complete example` section: `ThemedDemo` (full dark UI) then its code block

- [ ] **Step 3: Commit**

```bash
git add packages/docs/src/content/docs/core-concepts/theming.mdx
git commit -m "docs(demos): flip theming page sections to demo→code ordering"
```

---

## Task 9: Update composable-layout.mdx

**Files:**
- Modify: `packages/docs/src/content/docs/core-concepts/composable-layout.mdx`

- [ ] **Step 1: Rewrite composable-layout.mdx**

Replace the full content of `packages/docs/src/content/docs/core-concepts/composable-layout.mdx` with:

```mdx
---
title: Composable Layout
description: Build a custom card grid with thumbnail previews using FileList's render function and FileItem sub-components.
---

import ComposableDemo from "../../../components/demos/ComposableDemo";
import FileListGridColumnsDemo from "../../../components/demos/FileListGridColumnsDemo";

The default `FileList` renders a compact row per file. Passing a render function as `children` gives you full control over each card's layout, including where the thumbnail goes, how sub-components are arranged, and what the grid looks like.

<ComposableDemo client:load />

```tsx
import {
  DropZone,
  FileItem,
  FileList,
  Thumbnail,
  ViewModeProvider,
} from "@hyperserve/upload-react";
import { UploadProvider } from "@hyperserve/upload";

function App() {
  return (
    <UploadProvider config={config}>
      <ViewModeProvider defaultMode="grid">
        <DropZone />
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
      </ViewModeProvider>
    </UploadProvider>
  );
}
```

`FileList` reads the view mode from `ViewModeProvider` context and switches between list and grid CSS layout automatically. Each card is a `FileItem`, a compound component whose named sub-components (`FileName`, `Meta`, `UploadProgress`, etc.) read their state from the parent `FileItem` context, so you never pass `file` down manually.

## Customizing the grid

Control the grid column sizing with the `columns` prop:

<FileListGridColumnsDemo client:load />

```tsx
<FileList mode="grid" columns="repeat(3, 1fr)" />
```

## What each sub-component does

| Sub-component | When it renders |
|---------------|-----------------|
| `Thumbnail` | Thumbnail image while uploading; `<video>` when `playback` is set and file is ready |
| `FileItem.FileName` | Always |
| `FileItem.FileSize` | Always |
| `FileItem.StatusIcon` | Spinner during `processing`, check when `ready` |
| `FileItem.UploadProgress` | Only during `uploading` |
| `FileItem.ErrorMessage` | Only when `file.error` is set |
| `FileItem.RemoveButton` | Hidden during `processing` and `ready` |
| `FileItem.RetryButton` | Only when `failed` |

See the [FileItem](/components/file-item/) and [FileList](/components/file-list/) reference pages for the full prop API.
```

- [ ] **Step 2: Verify in browser**

Open the Composable Layout page. Confirm:
- Hero shows the `ComposableDemo` (interactive grid of file cards), immediately followed by the full App composition code — no `## How it works` heading between them
- `## Customizing the grid` section shows `FileListGridColumnsDemo` (3-column grid of default file items), then the `columns` code block below it
- Sub-components table renders correctly

- [ ] **Step 3: Commit**

```bash
git add packages/docs/src/content/docs/core-concepts/composable-layout.mdx
git commit -m "docs(demos): add hero code to composable-layout, wire grid columns demo"
```

---

## Self-Review Checklist

After all tasks complete, do a final pass:

- [ ] Every component page has a hero demo followed immediately by a code block
- [ ] No code block appears before its demo on any page
- [ ] `FileListEmptyDemo` renders correctly in the file-list page (was previously missing)
- [ ] `StatusBadge` customization demo shows both overridden (`ready`/`failed`) and default (`uploading`/`processing`) badges
- [ ] `FileListToolbar.ViewToggle` demo shows a working `<select>` that can switch between list/grid
- [ ] `ViewModeProvider` demos both show the file list reacting to view mode changes
- [ ] `theming.mdx` `## Status config` section: the import code block (no demo needed) precedes the usage code block that has a demo — this is correct
- [ ] `composable-layout.mdx` has no `## How it works` heading
- [ ] `FileListDemo.tsx` and `ThumbnailDemo.tsx` no longer exist on disk
