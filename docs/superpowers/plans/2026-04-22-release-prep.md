# Release Prep v0.1.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Get all 4 packages to a publishable 0.1.0 state with complete docs, open source scaffolding, and CI.

**Architecture:** TDD for the one code change (`updateFileStatus`), then documentation, package prep, and infrastructure in sequence. All changes land on `main` (branch-protected; work via PRs or directly if authorized).

**Tech Stack:** Bun, TypeScript, Vitest (web packages), Jest (RN package), Biome (lint/format), Lefthook, GitHub Actions.

---

## File Map

**New files:**
- `packages/core/README.md`
- `packages/react/README.md`
- `packages/react-native/README.md`
- `packages/upload-adapter-hyperserve/README.md`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `CHANGELOG.md`
- `.github/workflows/ci.yml`
- `.github/workflows/pr-title.yml`
- `lefthook.yml`

**Modified files:**
- `packages/core/src/types.ts` — add `updateFileStatus` to `UploadContextValue`
- `packages/core/src/context.tsx` — implement `updateFileStatus`
- `packages/core/src/__tests__/context.test.tsx` — 4 new tests
- `packages/react/src/DropZone.tsx` — extract `DropZoneRenderProps` named type
- `packages/react/src/index.ts` — export `DropZoneRenderProps`
- `packages/docs/src/content/docs/components/drop-zone.mdx` — document `DropZoneRenderProps`
- `packages/docs/src/content/docs/core-concepts/adapters.mdx` — add polling default note
- `docs/ARCHITECTURE.md` — StatusChecker two-path note + utility functions section
- `packages/core/package.json` — version, publishConfig, repository, keywords, typecheck script
- `packages/react/package.json` — same
- `packages/react-native/package.json` — same
- `packages/upload-adapter-hyperserve/package.json` — same
- `package.json` (root) — typecheck script, lefthook dev dep
- `README.md` (root) — replace TODO

---

## Task 1: `updateFileStatus` — failing tests

**Files:**
- Modify: `packages/core/src/types.ts`
- Modify: `packages/core/src/__tests__/context.test.tsx`

- [ ] Add `updateFileStatus` to `UploadContextValue` in `packages/core/src/types.ts`:

```typescript
export type UploadContextValue = {
  files: FileState[];
  addFiles: (files: FileRef[]) => void;
  removeFile: (id: string) => void;
  retryFile: (id: string) => void;
  updateFileStatus: (videoId: string, status: "ready" | "failed", playbackUrl?: string) => void;
  maxFiles?: number;
  canAddMore: boolean;
  isUploading: boolean;
  hasErrors: boolean;
  allReady: boolean;
  allSettled: boolean;
  readyCount: number;
  failedCount: number;
};
```

- [ ] Append these 4 tests to the `describe("UploadProvider + useUpload")` block in `packages/core/src/__tests__/context.test.tsx`:

```typescript
it("updateFileStatus transitions processing file to ready with playbackUrl", async () => {
  const adapter = createMockAdapter();
  const { result } = renderHook(() => useUpload(), {
    wrapper: makeWrapper(makeConfig({ adapter })),
  });
  act(() => { result.current.addFiles([makeFileRef()]); });
  await act(async () => { await vi.advanceTimersByTimeAsync(0); });
  expect(result.current.files[0].status).toBe("processing");
  act(() => {
    result.current.updateFileStatus("video-123", "ready", "https://cdn.example.com/v.mp4");
  });
  expect(result.current.files[0].status).toBe("ready");
  expect(result.current.files[0].playbackUrl).toBe("https://cdn.example.com/v.mp4");
});

it("updateFileStatus transitions processing file to failed", async () => {
  const adapter = createMockAdapter();
  const { result } = renderHook(() => useUpload(), {
    wrapper: makeWrapper(makeConfig({ adapter })),
  });
  act(() => { result.current.addFiles([makeFileRef()]); });
  await act(async () => { await vi.advanceTimersByTimeAsync(0); });
  expect(result.current.files[0].status).toBe("processing");
  act(() => { result.current.updateFileStatus("video-123", "failed"); });
  expect(result.current.files[0].status).toBe("failed");
  expect(result.current.files[0].error).toBe("Processing failed");
});

it("updateFileStatus is no-op for unknown videoId", async () => {
  const adapter = createMockAdapter();
  const { result } = renderHook(() => useUpload(), {
    wrapper: makeWrapper(makeConfig({ adapter })),
  });
  act(() => { result.current.addFiles([makeFileRef()]); });
  await act(async () => { await vi.advanceTimersByTimeAsync(0); });
  expect(result.current.files[0].status).toBe("processing");
  act(() => { result.current.updateFileStatus("nonexistent-id", "ready"); });
  expect(result.current.files[0].status).toBe("processing");
});

it("updateFileStatus is no-op when file is not processing", async () => {
  const adapter = createMockAdapter({
    videoId: "video-123",
    playbackUrl: "https://cdn.example.com/v.mp4",
  });
  const { result } = renderHook(() => useUpload(), {
    wrapper: makeWrapper(makeConfig({ adapter })),
  });
  act(() => { result.current.addFiles([makeFileRef()]); });
  await act(async () => { await vi.advanceTimersByTimeAsync(0); });
  expect(result.current.files[0].status).toBe("ready");
  act(() => { result.current.updateFileStatus("video-123", "failed"); });
  expect(result.current.files[0].status).toBe("ready");
});
```

- [ ] Run tests — expect 4 failures:

```bash
cd packages/core && bun run test
```

Expected: `TypeError: result.current.updateFileStatus is not a function` (×4)

- [ ] Commit:

```bash
git add packages/core/src/types.ts packages/core/src/__tests__/context.test.tsx
git commit -m "test(core): add failing tests for updateFileStatus"
```

---

## Task 2: `updateFileStatus` — implementation

**Files:**
- Modify: `packages/core/src/context.tsx`

- [ ] Add `updateFileStatus` callback after `retryFile` in `packages/core/src/context.tsx`:

```typescript
const updateFileStatus = useCallback(
  (videoId: string, status: "ready" | "failed", playbackUrl?: string) => {
    const file = filesRef.current.find(
      (f) => f.videoId === videoId && f.status === "processing",
    );
    if (!file) return;

    if (status === "ready") {
      const thumbnailUri = thumbnailUrisRef.current.get(file.id);
      if (thumbnailUri) {
        revokeThumbnail(thumbnailUri);
        thumbnailUrisRef.current.delete(file.id);
      }
    }

    dispatchWithStatusTracking({
      id: file.id,
      type: "UPDATE_FILE",
      updates: {
        error:
          status === "failed"
            ? (configRef.current.errorMessages?.processingFailed ?? "Processing failed")
            : null,
        playbackUrl: playbackUrl ?? null,
        status,
        ...(status === "ready" && { thumbnailUri: null }),
      },
    });
  },
  [dispatchWithStatusTracking],
);
```

- [ ] Add `updateFileStatus` to the `value` object and its `useMemo` deps array in context.tsx:

```typescript
const value: UploadContextValue = useMemo(
  () => ({
    addFiles,
    allReady,
    allSettled,
    canAddMore,
    failedCount,
    files,
    hasErrors,
    isUploading,
    maxFiles,
    readyCount,
    removeFile,
    retryFile,
    updateFileStatus,
  }),
  [
    files,
    addFiles,
    removeFile,
    retryFile,
    updateFileStatus,
    maxFiles,
    canAddMore,
    isUploading,
    hasErrors,
    allReady,
    allSettled,
    readyCount,
    failedCount,
  ],
);
```

- [ ] Run tests — all must pass:

```bash
cd packages/core && bun run test
```

Expected: all 83 tests pass (79 existing + 4 new)

- [ ] Commit:

```bash
git add packages/core/src/context.tsx
git commit -m "feat(core): add updateFileStatus to UploadContextValue"
```

---

## Task 3: `DropZoneRenderProps` named type

**Files:**
- Modify: `packages/react/src/DropZone.tsx`
- Modify: `packages/react/src/index.ts`

- [ ] In `packages/react/src/DropZone.tsx`, replace the inline type with a named export. Change the top of the file from:

```typescript
export type DropZoneProps = {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  activeStyle?: React.CSSProperties;
  className?: string;
  activeClassName?: string;
  supportingText?: React.ReactNode;
  children?:
    | React.ReactNode
    | ((state: { isDragging: boolean; openPicker: () => void }) => React.ReactNode);
};
```

To:

```typescript
export type DropZoneRenderProps = {
  isDragging: boolean;
  openPicker: () => void;
};

export type DropZoneProps = {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  activeStyle?: React.CSSProperties;
  className?: string;
  activeClassName?: string;
  supportingText?: React.ReactNode;
  children?: React.ReactNode | ((state: DropZoneRenderProps) => React.ReactNode);
};
```

- [ ] In `packages/react/src/index.ts`, update the DropZone export line:

```typescript
export type { DropZoneProps, DropZoneRenderProps } from "./DropZone.js";
```

- [ ] Run react tests:

```bash
cd packages/react && bun run test
```

Expected: 61 tests pass

- [ ] Commit:

```bash
git add packages/react/src/DropZone.tsx packages/react/src/index.ts
git commit -m "feat(react): export DropZoneRenderProps named type"
```

---

## Task 4: Documentation — ARCHITECTURE.md

**Files:**
- Modify: `docs/ARCHITECTURE.md`

- [ ] In `docs/ARCHITECTURE.md`, replace the StatusChecker paragraph that reads:

```
If no `statusChecker` is provided, the file stays in `"processing"` after upload — the consumer can drive status updates externally.
```

With:

```
If no `statusChecker` is provided, the file stays in `"processing"` after upload. Call `updateFileStatus(videoId, status, playbackUrl?)` from `useUpload()` to transition it externally — use this when your backend notifies you via webhook, SSE, or WebSocket instead of polling.
```

- [ ] Add a new **Utility Functions** section to `docs/ARCHITECTURE.md` before the Platform Split section:

```markdown
## Utility Functions

Helper functions exported from `@hyperserve/upload` for working with files.

### `toFileRef` / `toFileRefs`

Convert a browser `File` (or array / `FileList`) to a `WebFileRef`, or a React Native `DocumentPickerResult` (or array) to a `NativeFileRef`. These create the object URL (`uri`) used throughout the upload flow.

```typescript
import { toFileRef, toFileRefs } from "@hyperserve/upload";

// Web
const ref = toFileRef(file);           // File → WebFileRef
const refs = toFileRefs(fileList);     // FileList | File[] → WebFileRef[]

// React Native
const ref = toFileRef(pickerResult);   // DocumentPickerResult → NativeFileRef
```

### `revokeFileRef`

Revokes the object URL on a `WebFileRef` when you no longer need it. No-op on native.

```typescript
revokeFileRef(ref);
```

### `revokeThumbnail`

Manually revokes a thumbnail blob URL. The `UploadProvider` handles this automatically on file transition and unmount — only call this if you're managing thumbnails outside the provider.

```typescript
import { revokeThumbnail } from "@hyperserve/upload";
revokeThumbnail(file.thumbnailUri);
```
```

- [ ] Commit:

```bash
git add docs/ARCHITECTURE.md
git commit -m "docs: add updateFileStatus two-path note and utility functions section"
```

---

## Task 5: Documentation — docs site

**Files:**
- Modify: `packages/docs/src/content/docs/core-concepts/adapters.mdx`
- Modify: `packages/docs/src/content/docs/components/drop-zone.mdx`

- [ ] In `adapters.mdx`, after the StatusChecker section paragraph that ends with "you can drive status updates externally.", add:

```markdown
Call `updateFileStatus(videoId, "ready" | "failed", playbackUrl?)` from `useUpload()` to complete the transition from your webhook or SSE handler.

`HyperserveStatusChecker` defaults to a `pollingIntervalMs` of `3000` (3 seconds) when omitted from `createHyperserveConfig`.
```

- [ ] In `drop-zone.mdx`, update the `children` row in the props table from:

```
| `children` | `ReactNode \| (state) => ReactNode` | — | Custom content or render function |
```

To:

```
| `children` | `ReactNode \| ((state: DropZoneRenderProps) => ReactNode)` | — | Custom content or render function |
```

And add below the Render function section:

```markdown
### `DropZoneRenderProps`

```typescript
import type { DropZoneRenderProps } from "@hyperserve/upload-react";

type DropZoneRenderProps = {
  isDragging: boolean;
  openPicker: () => void;
};
```
```

- [ ] Build docs to confirm no errors:

```bash
bun run docs:build
```

Expected: exits 0

- [ ] Commit:

```bash
git add packages/docs/src/content/docs/core-concepts/adapters.mdx packages/docs/src/content/docs/components/drop-zone.mdx
git commit -m "docs: add updateFileStatus usage, polling default, and DropZoneRenderProps type"
```

---

## Task 6: Package versions and publish config

**Files:**
- Modify: `packages/core/package.json`
- Modify: `packages/react/package.json`
- Modify: `packages/react-native/package.json`
- Modify: `packages/upload-adapter-hyperserve/package.json`
- Modify: `package.json` (root)

- [ ] In each of the 4 package `package.json` files, make these changes:

**`packages/core/package.json`** — add/update:
```json
{
  "version": "0.1.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/hyper-serve/upload.git",
    "directory": "packages/core"
  },
  "publishConfig": { "access": "public" },
  "keywords": ["video", "upload", "react", "react-native", "headless", "cross-platform"],
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

**`packages/react/package.json`** — add/update:
```json
{
  "version": "0.1.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/hyper-serve/upload.git",
    "directory": "packages/react"
  },
  "publishConfig": { "access": "public" },
  "keywords": ["video", "upload", "react", "components", "ui"],
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

**`packages/react-native/package.json`** — add/update:
```json
{
  "version": "0.1.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/hyper-serve/upload.git",
    "directory": "packages/react-native"
  },
  "publishConfig": { "access": "public" },
  "keywords": ["video", "upload", "react-native", "mobile", "components"],
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

**`packages/upload-adapter-hyperserve/package.json`** — add/update:
```json
{
  "version": "0.1.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/hyper-serve/upload.git",
    "directory": "packages/upload-adapter-hyperserve"
  },
  "publishConfig": { "access": "public" },
  "keywords": ["video", "upload", "hyperserve", "adapter"],
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] In root `package.json`, add to `scripts`:

```json
"typecheck": "bun run --filter '@hyperserve/*' typecheck"
```

- [ ] Also update `peerDependencies` version ranges in `packages/react/package.json` and `packages/react-native/package.json` to match the new version:

```json
"peerDependencies": {
  "@hyperserve/upload": ">=0.1.0"
}
```

- [ ] Verify typecheck passes:

```bash
bun run typecheck
```

Expected: exits 0 across all packages

- [ ] Commit:

```bash
git add packages/core/package.json packages/react/package.json packages/react-native/package.json packages/upload-adapter-hyperserve/package.json package.json
git commit -m "chore: bump all packages to 0.1.0 and add publish config"
```

---

## Task 7: Root README

**Files:**
- Modify: `README.md`

- [ ] Replace the contents of `README.md` with:

```markdown
# @hyperserve/upload

Headless cross-platform video upload for React and React Native. Manage upload state, progress, validation, and status polling — bring your own UI or use the included composable components.

## Packages

| Package | Description |
|---------|-------------|
| [`@hyperserve/upload`](./packages/core) | Core hooks, state machine, validation |
| [`@hyperserve/upload-react`](./packages/react) | Web UI components (DropZone, FileList, etc.) |
| [`@hyperserve/upload-react-native`](./packages/react-native) | React Native UI components |
| [`@hyperserve/upload-adapter-hyperserve`](./packages/upload-adapter-hyperserve) | Official Hyperserve backend adapter |

## Installation

```bash
# Core + web components + Hyperserve adapter
npm install @hyperserve/upload @hyperserve/upload-react @hyperserve/upload-adapter-hyperserve

# React Native
npm install @hyperserve/upload @hyperserve/upload-react-native @hyperserve/upload-adapter-hyperserve
```

## Quick Start

```tsx
import { createHyperserveConfig } from "@hyperserve/upload-adapter-hyperserve";
import { UploadProvider } from "@hyperserve/upload";
import { DropZone, FileList } from "@hyperserve/upload-react";

const config = createHyperserveConfig({
  createUpload: async (file, options) =>
    fetch("/api/create-upload", {
      method: "POST",
      body: JSON.stringify({ name: file.name, size: file.size, ...options }),
    }).then((r) => r.json()),
  completeUpload: async (videoId) => {
    await fetch(`/api/complete-upload/${videoId}`, { method: "POST" });
  },
  getVideoStatus: async (videoId) =>
    fetch(`/api/video-status/${videoId}`).then((r) => r.json()),
  uploadOptions: { isPublic: true, resolutions: ["480p", "1080p"] },
});

export function App() {
  return (
    <UploadProvider config={config}>
      <DropZone supportingText="MP4, WebM, MOV — up to 500 MB" />
      <FileList />
    </UploadProvider>
  );
}
```

## Documentation

Full docs at **[your-docs-url]** — guides, component API, adapter setup, and custom backend walkthrough.

## License

MIT
```

- [ ] Commit:

```bash
git add README.md
git commit -m "docs: add root README with install and quick start"
```

---

## Task 8: Per-package READMEs

**Files:**
- Create: `packages/core/README.md`
- Create: `packages/react/README.md`
- Create: `packages/react-native/README.md`
- Create: `packages/upload-adapter-hyperserve/README.md`

- [ ] Create `packages/core/README.md`:

```markdown
# @hyperserve/upload

Headless video upload state machine for React and React Native. Manages file queue, concurrency, validation, progress, and status polling. Bring your own UI or use `@hyperserve/upload-react` / `@hyperserve/upload-react-native`.

## Install

```bash
npm install @hyperserve/upload
```

## Usage

```tsx
import { UploadProvider, useUpload } from "@hyperserve/upload";

<UploadProvider config={config}>
  <YourUI />
</UploadProvider>

function YourUI() {
  const { files, addFiles } = useUpload();
  // ...
}
```

See the [full documentation](https://your-docs-url) for adapters, validators, and the headless guide.
```

- [ ] Create `packages/react/README.md`:

```markdown
# @hyperserve/upload-react

Composable React UI components for `@hyperserve/upload`. Includes DropZone, FileList, FileItem, ProgressBar, StatusBadge, Thumbnail, and FileListToolbar.

## Install

```bash
npm install @hyperserve/upload @hyperserve/upload-react
```

## Usage

```tsx
import { DropZone, FileList, FileListToolbar, ViewModeProvider } from "@hyperserve/upload-react";
import { UploadProvider } from "@hyperserve/upload";

<UploadProvider config={config}>
  <ViewModeProvider>
    <DropZone supportingText="MP4, WebM — up to 500 MB" />
    <FileListToolbar right={<FileListToolbar.ViewToggle />} />
    <FileList />
  </ViewModeProvider>
</UploadProvider>
```

See the [full documentation](https://your-docs-url) for component API and theming.
```

- [ ] Create `packages/react-native/README.md`:

```markdown
# @hyperserve/upload-react-native

Composable React Native UI components for `@hyperserve/upload`. Includes FilePicker, FileList, FileItem, ProgressBar, StatusBadge, Thumbnail, and FileListToolbar.

## Install

```bash
npm install @hyperserve/upload @hyperserve/upload-react-native
```

## Usage

```tsx
import { FilePicker, FileList } from "@hyperserve/upload-react-native";
import { UploadProvider } from "@hyperserve/upload";
import * as DocumentPicker from "expo-document-picker";
import { toFileRefs } from "@hyperserve/upload";

<UploadProvider config={config}>
  <FilePicker
    pickFiles={async () => {
      const result = await DocumentPicker.getDocumentAsync({ type: "video/*", multiple: true });
      return result.canceled ? [] : toFileRefs(result.assets);
    }}
  />
  <FileList />
</UploadProvider>
```

See the [full documentation](https://your-docs-url).
```

- [ ] Create `packages/upload-adapter-hyperserve/README.md`:

```markdown
# @hyperserve/upload-adapter-hyperserve

Official Hyperserve adapter for `@hyperserve/upload`. Handles file upload to Hyperserve-managed storage via signed URLs and polls for processing status.

## Install

```bash
npm install @hyperserve/upload @hyperserve/upload-adapter-hyperserve
```

## Usage

```tsx
import { createHyperserveConfig } from "@hyperserve/upload-adapter-hyperserve";

const config = createHyperserveConfig({
  createUpload: async (file, options) =>
    fetch("/api/create-upload", {
      method: "POST",
      body: JSON.stringify({ name: file.name, size: file.size, ...options }),
    }).then((r) => r.json()),
  completeUpload: async (videoId) => {
    await fetch(`/api/complete-upload/${videoId}`, { method: "POST" });
  },
  getVideoStatus: async (videoId) =>
    fetch(`/api/video-status/${videoId}`).then((r) => r.json()),
  uploadOptions: { isPublic: true, resolutions: ["480p", "1080p"] },
});
```

The callbacks call your backend, which proxies to Hyperserve with your API key. See the [full documentation](https://your-docs-url).
```

- [ ] Commit:

```bash
git add packages/core/README.md packages/react/README.md packages/react-native/README.md packages/upload-adapter-hyperserve/README.md
git commit -m "docs: add per-package READMEs for npm"
```

---

## Task 9: Open source markdown files

**Files:**
- Create: `CONTRIBUTING.md`
- Create: `CODE_OF_CONDUCT.md`
- Create: `SECURITY.md`
- Create: `CHANGELOG.md`

- [ ] Create `CONTRIBUTING.md`:

```markdown
# Contributing

## Prerequisites

- [Bun](https://bun.sh) >= 1.0
- Node.js >= 18

## Setup

```bash
git clone https://github.com/hyper-serve/upload
cd upload
bun install
bun run build
```

## Development

```bash
bun run test          # run all tests
bun run lint:check    # check lint
bun run format:check  # check formatting
bun run format:write  # auto-format
bun run typecheck     # type check all packages
bun run docs:dev      # docs site dev server
```

## Pre-push hook

Install [Lefthook](https://github.com/evilmartians/lefthook) to run lint, format, and type checks before every push:

```bash
bunx lefthook install
```

## Pull requests

- Branch from `main`
- PR titles must follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `build:`
- Individual commits have no required format — we squash on merge
- CI checks lint, format, types, build, and tests on every PR

## Questions

Open a [GitHub Discussion](https://github.com/hyper-serve/upload/discussions).
```

- [ ] Create `CODE_OF_CONDUCT.md` with the Contributor Covenant v2.1. Use the canonical text from [https://www.contributor-covenant.org/version/2/1/code_of_conduct/](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) — paste the full text directly into the file. The contact email placeholder should be replaced with the project maintainer's contact.

- [ ] Create `SECURITY.md`:

```markdown
# Security Policy

## Reporting a Vulnerability

Please do not open a public GitHub issue for security vulnerabilities.

Report vulnerabilities privately via [GitHub Security Advisories](https://github.com/hyper-serve/upload/security/advisories/new).

We aim to acknowledge reports within 48 hours and provide a resolution timeline within 7 days.
```

- [ ] Create `CHANGELOG.md`:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] — 2026-04-22

### Added

- `@hyperserve/upload` — headless upload state machine, validation, platform utilities
- `@hyperserve/upload-react` — web UI components: DropZone, FileList, FileItem, ProgressBar, StatusBadge, Thumbnail, FileListToolbar
- `@hyperserve/upload-react-native` — React Native UI components with the same compound component API
- `@hyperserve/upload-adapter-hyperserve` — official Hyperserve adapter with signed URL upload and polling status checker
- `updateFileStatus` API on `useUpload()` for webhook/SSE-driven status transitions
- `DropZoneRenderProps` exported type for typed render function children
```

- [ ] Commit:

```bash
git add CONTRIBUTING.md CODE_OF_CONDUCT.md SECURITY.md CHANGELOG.md
git commit -m "chore: add open source contribution files"
```

---

## Task 10: GitHub Actions

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/pr-title.yml`

- [ ] Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2

      - name: Install dependencies
        run: bun install

      - name: Build
        run: bun run build

      - name: Type check
        run: bun run typecheck

      - name: Lint
        run: bun run lint:check

      - name: Format
        run: bun run format:check

      - name: Test
        run: bun run test
```

- [ ] Create `.github/workflows/pr-title.yml`:

```yaml
name: PR Title

on:
  pull_request:
    branches: [main]
    types: [opened, edited, synchronize]

jobs:
  check-title:
    runs-on: ubuntu-latest
    steps:
      - name: Check conventional commit format
        env:
          PR_TITLE: ${{ github.event.pull_request.title }}
        run: |
          echo "PR title: $PR_TITLE"
          if ! echo "$PR_TITLE" | grep -qE '^(feat|fix|chore|docs|refactor|test|build|perf|ci|revert)(\(.+\))?: .+'; then
            echo "PR title must follow Conventional Commits format."
            echo "Examples: feat: add video trim support"
            echo "          fix(core): handle abort during validation"
            echo "          chore: bump dependencies"
            exit 1
          fi
```

- [ ] Commit:

```bash
git add .github/workflows/ci.yml .github/workflows/pr-title.yml
git commit -m "ci: add CI and PR title check workflows"
```

---

## Task 11: Lefthook pre-push hook

**Files:**
- Create: `lefthook.yml`
- Modify: `package.json` (root)

- [ ] Create `lefthook.yml` at the repo root:

```yaml
pre-push:
  commands:
    typecheck:
      run: bun run typecheck
    lint:
      run: bun run lint:check
    format:
      run: bun run format:check
```

- [ ] Add `lefthook` to root `package.json` devDependencies:

```json
"devDependencies": {
  "@babel/runtime": "^7.28.6",
  "@biomejs/biome": "2.4.4",
  "lefthook": "latest"
}
```

- [ ] Install and register the hook:

```bash
bun install
bunx lefthook install
```

Expected: `SYNCED lefthook.yml`

- [ ] Verify the hook file exists:

```bash
ls .git/hooks/pre-push
```

- [ ] Commit:

```bash
git add lefthook.yml package.json bun.lock
git commit -m "chore: add lefthook pre-push hook for lint, format, typecheck"
```

---

## Task 12: Pre-publish verification

- [ ] Run full test suite per package:

```bash
bun run test
```

Expected: all packages exit 0

- [ ] Run build:

```bash
bun run build
```

Expected: all packages exit 0, `dist/` present in each

- [ ] Run typecheck:

```bash
bun run typecheck
```

Expected: exits 0

- [ ] Run lint:

```bash
bun run lint:check
```

Expected: exits 0

- [ ] Run format check:

```bash
bun run format:check
```

Expected: exits 0

- [ ] Build docs:

```bash
bun run docs:build
```

Expected: exits 0

- [ ] Spot-check package fields — for each of the 4 packages, confirm:
  - `"version": "0.1.0"` ✓
  - `"publishConfig": { "access": "public" }` ✓
  - `"repository"` present ✓
  - `"files": ["dist"]` ✓
  - `"exports"` points to `./dist/index.js` and `./dist/index.d.ts` ✓

- [ ] Commit if any fixes were needed, then tag:

```bash
git tag v0.1.0
```
