# React Native Docs Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move `guides/react-native.mdx` to `getting-started/react-native.mdx`, trim the duplicate install and example sections, and update the sidebar and LinkCard to match.

**Architecture:** Three targeted file changes — create the new page from trimmed content, update the sidebar config, update the installation LinkCard. No new abstractions.

**Tech Stack:** Astro/Starlight MDX docs site.

---

### Task 1: Create `getting-started/react-native.mdx`

**Files:**
- Create: `packages/docs/src/content/docs/getting-started/react-native.mdx`

The new page keeps platform resolution, FileRef, and the components comparison table. It drops the Setup section (install commands already live on installation.mdx) and the Example section (covered by guides/expo.mdx).

- [ ] **Step 1: Create the file**

Create `packages/docs/src/content/docs/getting-started/react-native.mdx`. The file has three sections — platform resolution, FileRef, and components. No frontmatter imports are needed.

Frontmatter:

```yaml
---
title: React Native
description: Platform resolution, FileRef, and component API for React Native.
---
```

Platform resolution section (paste after frontmatter):

```md
## Platform resolution

The adapter packages use the `.native.ts` convention. Metro resolves `foo.js` to `foo.native.ts` when bundling for iOS/Android.

| Module | Web | Native |
|--------|-----|--------|
| `adapter/hyperserve` | XHR with progress events | `react-native-background-upload` with fallback to `fetch` |
| `platform/fileRef` | `File` → `FileRef` with `raw` | `DocumentPickerResult` → `FileRef` with `uri` |
| `platform/thumbnail` | `URL.createObjectURL` | `expo-video-thumbnails` or `null` |
| `validation/maxDuration` | DOM video element | `expo-video-metadata` (skips if missing) |
```

FileRef section:

````md
## FileRef

`FileRef` is a discriminated union on `platform`:

```typescript
type WebFileRef  = { platform: "web";    uri: string; name: string; size: number; type: string; raw: File };
type NativeFileRef = { platform: "native"; uri: string; name: string; size: number; type: string };
```

On native, `raw` is not available; the adapter uses the `uri` directly.
````

Components section:

```md
## Components

The native UI package mirrors the web package:

| Web | Native |
|-----|--------|
| `DropZone` | `FilePicker` |
| `FileList` | `FileList` (uses `FlatList`, supports `numColumns`) |
| `FileItem` + sub-components | Same compound component API |
| `FileListToolbar` | Same API |
| `Thumbnail` | Renders `Image` (no built-in playback) |
```

- [ ] **Step 2: Delete the old file**

```bash
rm packages/docs/src/content/docs/guides/react-native.mdx
```

- [ ] **Step 3: Commit**

```bash
git add packages/docs/src/content/docs/getting-started/react-native.mdx
git rm packages/docs/src/content/docs/guides/react-native.mdx
git commit -m "docs(react-native): move to getting-started and trim duplicate sections"
```

---

### Task 2: Update the sidebar

**Files:**
- Modify: `packages/docs/astro.config.mjs`

- [ ] **Step 1: Add React Native to Getting Started**

In `packages/docs/astro.config.mjs`, find the Getting Started sidebar group:

```js
{
  items: [
    { label: "Introduction", slug: "index" },
    { label: "Installation", slug: "getting-started/installation" },
    { label: "Quick Start", slug: "getting-started/quick-start" },
  ],
  label: "Getting Started",
},
```

Change it to:

```js
{
  items: [
    { label: "Introduction", slug: "index" },
    { label: "Installation", slug: "getting-started/installation" },
    { label: "Quick Start", slug: "getting-started/quick-start" },
    { label: "React Native", slug: "getting-started/react-native" },
  ],
  label: "Getting Started",
},
```

- [ ] **Step 2: Remove React Native from Guides**

Find the Guides sidebar group:

```js
{
  items: [
    { label: "Example: Next.js", slug: "guides/next-js" },
    { label: "Example: Expo", slug: "guides/expo" },
    { label: "Setup: React Native", slug: "guides/react-native" },
  ],
  label: "Guides",
},
```

Change it to:

```js
{
  items: [
    { label: "Example: Next.js", slug: "guides/next-js" },
    { label: "Example: Expo", slug: "guides/expo" },
  ],
  label: "Guides",
},
```

- [ ] **Step 3: Commit**

```bash
git add packages/docs/astro.config.mjs
git commit -m "docs(sidebar): move React Native from Guides to Getting Started"
```

---

### Task 3: Update the LinkCard in installation.mdx

**Files:**
- Modify: `packages/docs/src/content/docs/getting-started/installation.mdx`

- [ ] **Step 1: Update the href**

Find:

```mdx
<LinkCard
  title="React Native guide"
  description="Platform resolution, FileRef, components, and a full example."
  href="/guides/react-native/"
/>
```

Change to:

```mdx
<LinkCard
  title="React Native setup"
  description="Platform resolution, FileRef, and component API."
  href="/getting-started/react-native/"
/>
```

- [ ] **Step 2: Commit**

```bash
git add packages/docs/src/content/docs/getting-started/installation.mdx
git commit -m "docs(installation): update React Native LinkCard to new location"
```

---

### Task 4: Verify

- [ ] **Step 1: Build and check for broken links**

```bash
cd packages/docs && npm run build
```

Expected: build completes with no errors or dead-link warnings referencing `guides/react-native`.

- [ ] **Step 2: Spot-check the dev server**

```bash
cd packages/docs && npm run dev
```

- Open `http://localhost:4321/getting-started/react-native/` — page loads with platform resolution, FileRef, and components sections.
- Open `http://localhost:4321/getting-started/installation/` — LinkCard points to the new URL and title reads "React Native setup".
- Sidebar shows React Native under Getting Started, not under Guides.
- `http://localhost:4321/guides/react-native/` returns 404.
