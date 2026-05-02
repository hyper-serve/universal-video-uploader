# Component Docs Demo Audit

**Date:** 2026-05-02  
**Scope:** All 8 component pages in `packages/docs/src/content/docs/components/` plus 2 core-concept pages in `packages/docs/src/content/docs/core-concepts/`

## Goals

1. Every demo has its exact matching code snippet shown directly below it
2. Standard ordering: **demo → code** everywhere (no code → demo)
3. No demo exists without code; no standalone hero without a code snippet
4. Remove demos that duplicate other demos on the same page
5. Add demos wherever a meaningful code example has none

---

## Standard Page Pattern

```
[opening description paragraph]

[Demo component]

```tsx
// exact code that produces the demo above
```

## Props

[table]

## [Feature section]

[Demo component]

```tsx
// exact code
```
```

The hero position (top of page, before Props) is always the most common / default usage. Every section that has a code example has a demo above it showing the exact result. Type definitions (`type Foo = { ... }`) are code-only — they are not usage examples and do not need demos.

---

## Demo Files

### Delete (redundant)

Remove the import from the respective `.mdx` file and delete the `.tsx` file from disk.

| File | Reason |
|------|--------|
| `FileListDemo.tsx` | Covered by `FileListDefaultDemo` (list) + `FileListGridColumnsDemo` (grid) |
| `ThumbnailDemo.tsx` | Covered by `ThumbnailBasicDemo` (image/placeholder) + `ThumbnailPlaybackDemo` (playback) |

### Create (8 new files)

#### `DropZoneRenderFunctionDemo.tsx`

Wraps `UploadProvider` (MockAdapter). Shows a simple custom layout using the render function.

**Code shown in docs:**
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

---

#### `FileListToolbarFileCountDemo.tsx`

Wraps `MockFilesProvider` (4 mock files). Shows FileCount with custom label render prop.

**Code shown in docs:**
```tsx
<FileListToolbar
  left={
    <FileListToolbar.FileCount
      label={(count) => `${count} video${count !== 1 ? "s" : ""}`}
    />
  }
/>
```

---

#### `FileListToolbarViewToggleDemo.tsx`

Wraps `MockFilesProvider` (which includes ViewModeProvider). Shows ViewToggle with a `<select>` as custom children.

**Code shown in docs:**
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

---

#### `ProgressBarStylingDemo.tsx`

Static (no provider). Shows a single bar at 75% with styled track and gradient fill.

**Code shown in docs:**
```tsx
<ProgressBar
  progress={75}
  trackStyle={{ height: 8, borderRadius: 4 }}
  fillStyle={{ background: "linear-gradient(90deg, #06b6d4, #3b82f6)" }}
/>
```

---

#### `StatusBadgeCustomizationDemo.tsx`

Static. Shows `ready` and `failed` badges side-by-side with `statusConfig` overrides applied.

**Code shown in docs:**
```tsx
const statusConfig = {
  ready: { bg: "#dbeafe", text: "#1d4ed8", label: "Complete" },
  failed: { bg: "#fee2e2", text: "#dc2626", label: "Error" },
};

<StatusBadge status="ready" statusConfig={statusConfig} />
<StatusBadge status="failed" statusConfig={statusConfig} />
```

---

#### `StatusBadgeHeadlessDemo.tsx`

Static. Shows all statuses rendered via the children render function as plain bold text.

**Code shown in docs:**
```tsx
<StatusBadge status={file.status}>
  {({ label, color }) => (
    <span style={{ color, fontWeight: 600 }}>{label}</span>
  )}
</StatusBadge>
```

---

#### `ViewModeProviderDemo.tsx`

Wraps `MockFilesProvider`. Renders FileListToolbar (with ViewToggle) + FileList. The view toggle is functional — clicking it switches between list and grid.

**Code shown in docs:**
```tsx
<UploadProvider config={config}>
  <ViewModeProvider>
    <DropZone />
    <FileListToolbar />
    <FileList />
  </ViewModeProvider>
</UploadProvider>
```

---

#### `ViewModeProviderHookDemo.tsx`

Wraps `MockFilesProvider`. Shows a custom toggle button built with `useViewMode`, plus the FileList below it reacting to the toggle.

**Code shown in docs:**
```tsx
function MyViewToggle() {
  const { viewMode, setViewMode } = useViewMode();
  return (
    <button onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}>
      {viewMode === "list" ? "Switch to grid" : "Switch to list"}
    </button>
  );
}
```

---

## Per-page Changes

### `file-item.mdx`

**Structure:**
1. Description paragraph
2. `FileItemDemo` → code `<FileItem file={file} />`  
3. `## Usage` — `FileItemColumnDemo` → compound composition code (full column layout)
4. `## Props` table
5. `## Sub-components` table
6. `## Default rendering` prose

**Changes:** Add code after hero. Flip Usage section to demo → code.

---

### `file-list.mdx`

**Structure:**
1. Description paragraph
2. `FileListDefaultDemo` → code `<FileList />` ← *new hero position*
3. `FileListEmptyDemo` → code `<FileList emptyMessage="No files selected yet." />`
4. `FileListGridColumnsDemo` → code `<FileList mode="grid" columns="repeat(3, 1fr)" />`
5. `## Props` table
6. `## Custom item rendering` — `FileListCustomItemDemo` → full render-function code
7. `## View mode` prose

**Changes:** Remove `FileListDemo` import/render. Fix bug: add `<FileListEmptyDemo client:load />` between the emptyMessage code block and the grid block. Flip all to demo → code.

---

### `thumbnail.mdx`

**Structure:**
1. Description paragraph
2. `ThumbnailBasicDemo` → code `<Thumbnail file={file} />` ← *new hero position*
3. `ThumbnailPlaybackDemo` → code `<Thumbnail file={file} playback />`
4. `## Props` table
5. `## Behavior` prose

**Changes:** Remove `ThumbnailDemo` import/render. Flip to demo → code.

---

### `drop-zone.mdx`

**Structure:**
1. Description paragraph
2. `DropZoneDemo` → code `<DropZone supportingText="MP4, WebM, MOV, up to 500 MB" />`
3. `## Props` table
4. `## Render function` — `DropZoneRenderFunctionDemo` → render function JSX code
5. `### DropZoneRenderProps` — type definition block only (no demo)
6. `## Styling` prose

**Changes:** Add code after hero. Remove the old `## Usage` section (was just the same code as the hero, no demo). Add `DropZoneRenderFunctionDemo` before the render function code block.

---

### `file-list-toolbar.mdx`

**Structure:**
1. Description paragraph
2. `FileListToolbarDemo` → code `<FileListToolbar />`
3. `## Props` table
4. `## Sub-components`
   - `### FileListToolbar.FileCount` — `FileListToolbarFileCountDemo` → label render prop code
   - `### FileListToolbar.ViewToggle` — `FileListToolbarViewToggleDemo` → custom select code
5. `## Props` table (already exists, stays)

**Changes:** Add code after hero. Remove the old `## Usage` section (default variant = hero; custom-right-slot = same visual as default; hide-slots = empty bar with no value). Add the two sub-component demos before their code blocks.

---

### `progress-bar.mdx`

**Structure:**
1. Description paragraph
2. `ProgressBarDemo` → code `<ProgressBar progress={75} />`
3. `## Props` table
4. `## Styling` — `ProgressBarStylingDemo` → trackStyle/fillStyle code

**Changes:** Add code after hero. Remove old `## Usage` section (was `<ProgressBar progress={file.progress} />` with no demo — redundant with hero). Add `ProgressBarStylingDemo` before the styling code block.

---

### `status-badge.mdx`

**Structure:**
1. Description paragraph
2. `StatusBadgeDemo` → code `<StatusBadge status={file.status} />`
3. `## Props` table
4. `## Customization` — `StatusBadgeCustomizationDemo` → statusConfig code
5. `## Headless mode` — `StatusBadgeHeadlessDemo` → children render function code

**Changes:** Add code after hero. Remove old `## Usage` section (was `<StatusBadge status={file.status} />` with no demo — same as hero code). Add `StatusBadgeCustomizationDemo` and `StatusBadgeHeadlessDemo` before their respective code blocks.

---

### `view-mode-provider.mdx`

**Structure:**
1. Description paragraph
2. `ViewModeProviderDemo` → App composition code
3. `## Props` table
4. `## useViewMode` — `ViewModeProviderHookDemo` → custom toggle code
5. `## React Native` — code only (no web demo possible, stays as-is)

**Changes:** Add `ViewModeProviderDemo` at the top (before Props). Add `ViewModeProviderHookDemo` before the useViewMode code block. Flip to demo → code.

---

### `theming.mdx` (core-concept)

**Current state:** All 3 focused demos (`ThemingStatusConfigDemo`, `ThemingFileItemDemo`, `ThemingDropZoneDemo`) are already imported and rendered. `ThemedDemo` is a "Complete example" at the bottom with code below it (already demo → code). The 3 section demos follow the wrong ordering (code → demo). Two sections — `## Theme tokens` and `## Status config` import block — are import/type code and need no demos.

**Structure:**
1. Description paragraph
2. `## Theme tokens` — import code only (no demo: plain object exports, not a component)
3. `## Status config` — import code only + `ThemingStatusConfigDemo` → statusConfig override code
4. `## Style props` — `ThemingFileItemDemo` → FileItem style code; `ThemingDropZoneDemo` → DropZone style code
5. `## Complete example` — `ThemedDemo` → full composite code (already correct ordering)

**Code shown with `ThemingStatusConfigDemo`:**
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

**Code shown with `ThemingFileItemDemo`:**
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

**Code shown with `ThemingDropZoneDemo`:**
```tsx
<DropZone
  style={{ background: "#1e293b", border: "1px dashed #334155" }}
  activeStyle={{ background: "#1e1b4b", borderColor: "#818cf8" }}
/>
```

**Changes:** Flip `## Status config` and `## Style props` sections from code → demo to demo → code. `## Complete example` is already correct.

---

### `composable-layout.mdx` (core-concept)

**Current state:** `ComposableDemo` hero (no code), then `## How it works` code block, then `## Customizing the grid` code block (no demo), then sub-component table.

**Structure:**
1. Description paragraph
2. `ComposableDemo` → full App composition code (collapse into hero — remove `## How it works` section header, code follows demo directly)
3. `## Customizing the grid` — `FileListGridColumnsDemo` (reuse existing) → `columns` prop code
4. `## What each sub-component does` table (stays)

**Changes:** Move the "How it works" code block to immediately follow `ComposableDemo` (remove `## How it works` header — the code IS the explanation). Wire `FileListGridColumnsDemo` before the `columns` code block.

---

## Summary Counts

| Category | Count |
|----------|-------|
| Pages updated | 10 (8 component + 2 core-concept) |
| Demo files deleted | 2 |
| Demo files created | 8 |
| Demo ordering flips (code→demo to demo→code) | all demoed sections across all 10 pages |
| Heroes that get code added | 9 |
| Code-only sections that get new demos | 8 (new files) + 1 (composable grid, reuses existing) |
| Bugs fixed | 1 (FileListEmptyDemo not rendered) |
