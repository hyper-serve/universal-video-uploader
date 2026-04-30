# Component Docs Demo Improvements

**Date:** 2026-04-29  
**Pages:** `thumbnail.mdx`, `file-item.mdx`, `file-list.mdx`

## Goal

Every code block example on the three component pages is followed by a rendered demo showing exactly that configuration. Demos display real thumbnails and functional video playback for the "ready" state.

---

## Shared constants (`mockFileState.ts`)

Export two new constants so all demos share them without redefining:

- `THUMB_SVG` — inline SVG data URI representing a thumbnail placeholder image (160×90, grey with filename text). Already defined locally in `ThumbnailDemo` and `FileListDemo`; move to the shared module.
- `VIDEO_URL` — `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4` — Google-hosted 15-second clip used as the `playbackUrl` for all "ready" state mocks.

---

## `thumbnail.mdx`

### Top demo — `ThumbnailDemo` (update)

Add a 4th column to the existing side-by-side showcase:

| Placeholder | Image | Ready (no URL) | Playback |
|---|---|---|---|
| no thumbnailUri, not ready | thumbnailUri = THUMB_SVG | status ready, no playbackUrl | status ready, playbackUrl = VIDEO_URL, thumbnailUri = THUMB_SVG |

### Usage section (restructure)

Split the single combined code block into two, each followed by its own demo:

**Block 1: `<Thumbnail file={file} />`**  
→ New `ThumbnailBasicDemo`: two side-by-side thumbnails — one with `thumbnailUri: THUMB_SVG` (renders `<img>`), one without (renders placeholder).

**Block 2: `<Thumbnail file={file} playback />`**  
→ New `ThumbnailPlaybackDemo`: single ready file with `playbackUrl: VIDEO_URL` and `thumbnailUri: THUMB_SVG`. Renders an actual `<video>` player.

---

## `file-item.mdx`

### Top demo — `FileItemDemo` (fix + update)

Fix `fi-3` (the "ready" file):
- Replace `playbackUrl: "https://example.com/video.mp4"` with `playbackUrl: VIDEO_URL`
- Add `thumbnailUri: THUMB_SVG`

The row-layout thumbnail for the ready file will show the SVG image; the video player loads correctly when the user interacts with it.

### Usage section

The existing code block shows a custom column compound layout. Add directly after it:

**New `FileItemColumnDemo`**: single ready file (`playbackUrl: VIDEO_URL`, `thumbnailUri: THUMB_SVG`) rendered in the exact column layout from the code block:
- `<Thumbnail file={file} playback />` on top
- `FileItem.FileName`
- `FileItem.Meta` (FileSize + StatusIcon)
- `FileItem.UploadProgress`
- `FileItem.ErrorMessage`
- `FileItem.Actions` (RemoveButton + RetryButton)

---

## `file-list.mdx`

### Top demo — `FileListDemo` (update)

Update `fl-3` (the "ready" file): replace `thumbnailUri: THUMB_SVG` (added in prior fix) with `playbackUrl: VIDEO_URL` so the top showcase demo shows the full video-ready state.

### Usage section (restructure)

Split the current single combined code block into three separate blocks, each followed by a demo:

All three inline demos share the same 4-file mock set as the top `FileListDemo`: uploading, processing, ready (with `playbackUrl: VIDEO_URL`, `thumbnailUri: THUMB_SVG`), and failed.

**Block 1: `<FileList />`**  
→ New `FileListDefaultDemo`: 4-file mock set in default list mode.

**Block 2: `<FileList emptyMessage="No files selected yet." />`**  
→ New `FileListEmptyDemo`: `MockFilesProvider` with an empty file array, `emptyMessage="No files selected yet."` prop set.

**Block 3: `<FileList mode="grid" columns="repeat(3, 1fr)" />`**  
→ New `FileListGridColumnsDemo`: same 4-file mock set in a 3-column grid layout.

### Custom item rendering section

Existing code block already isolated. Add directly after it:

**New `FileListCustomItemDemo`**: same 4-file mock set. Renders the exact render-function layout from the docs — for each file, a column `FileItem` with `Thumbnail` (playback, so the ready file shows the video player) + `FileItem.FileName` + `FileItem.UploadProgress` + `FileItem.Actions` (RemoveButton + RetryButton).

---

## New files

| File | Purpose |
|------|---------|
| `ThumbnailBasicDemo.tsx` | Inline demo for `<Thumbnail file={file} />` |
| `ThumbnailPlaybackDemo.tsx` | Inline demo for `<Thumbnail file={file} playback />` |
| `FileItemColumnDemo.tsx` | Inline demo for custom column compound layout |
| `FileListDefaultDemo.tsx` | Inline demo for `<FileList />` |
| `FileListEmptyDemo.tsx` | Inline demo for `<FileList emptyMessage="..." />` |
| `FileListGridColumnsDemo.tsx` | Inline demo for `<FileList mode="grid" columns="repeat(3, 1fr)" />` |
| `FileListCustomItemDemo.tsx` | Inline demo for custom render-function layout |

## Updated files

| File | Change |
|------|--------|
| `mockFileState.ts` | Export `THUMB_SVG` and `VIDEO_URL` |
| `ThumbnailDemo.tsx` | Add 4th playback column; import from mockFileState |
| `FileItemDemo.tsx` | Fix fi-3 playbackUrl + thumbnailUri |
| `FileListDemo.tsx` | Update fl-3 to use VIDEO_URL playbackUrl |
| `thumbnail.mdx` | Split code block, add two demo imports |
| `file-item.mdx` | Add FileItemColumnDemo import after code block |
| `file-list.mdx` | Split code block, add four demo imports |
