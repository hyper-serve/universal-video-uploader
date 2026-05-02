# Quick Start Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve `quick-start.mdx` by adding an intro + prereqs, a Hyperserve callout block, and a backend contract section, while removing the now-redundant "Using a different adapter" section.

**Architecture:** Single MDX file edit. Three content additions and one removal. Uses two Starlight components (`<Aside>`, `<LinkCard>`) already used throughout the docs site.

**Tech Stack:** Astro + Starlight MDX, `@astrojs/starlight/components`

---

## File Map

| Action | Path |
|--------|------|
| Modify | `packages/docs/src/content/docs/getting-started/quick-start.mdx` |

---

### Task 1: Add Starlight component imports

**Files:**
- Modify: `packages/docs/src/content/docs/getting-started/quick-start.mdx`

The file currently has no imports. Add one import line immediately after the frontmatter block.

- [ ] **Step 1: Open the file and locate the frontmatter end**

The file starts with:
```
---
title: Quick Start
description: Get a working upload UI in under 20 lines of code.
---
```
The line after `---` is currently blank, then `## Minimal example`.

- [ ] **Step 2: Insert the import line**

After the closing `---` of the frontmatter, add:

```mdx
---
title: Quick Start
description: Get a working upload UI in under 20 lines of code.
---

import { Aside, LinkCard } from "@astrojs/starlight/components";
```

- [ ] **Step 3: Verify the dev server accepts the change**

```bash
cd packages/docs && bun dev
```

Open `http://localhost:4321/getting-started/quick-start/` in a browser. The page should render without errors. (No visible change yet — imports are invisible.)

---

### Task 2: Add intro paragraph and prerequisites

**Files:**
- Modify: `packages/docs/src/content/docs/getting-started/quick-start.mdx`

- [ ] **Step 1: Insert intro content between the import and the first heading**

After the import line and before `## Minimal example`, add:

```mdx
import { Aside, LinkCard } from "@astrojs/starlight/components";

This guide gets you from zero to a working video upload UI in about 20 lines of React.

**Prerequisites**
- React 18+
- Packages installed (see [Installation](/getting-started/installation/))
- A Hyperserve account and API key (for the example below)

## Minimal example
```

- [ ] **Step 2: Verify in browser**

Reload `http://localhost:4321/getting-started/quick-start/`. The intro paragraph and prerequisites list should appear at the top of the page above the "Minimal example" heading.

- [ ] **Step 3: Commit**

```bash
git add packages/docs/src/content/docs/getting-started/quick-start.mdx
git commit -m "docs(quick-start): add intro paragraph and prerequisites"
```

---

### Task 3: Add Hyperserve callout block

**Files:**
- Modify: `packages/docs/src/content/docs/getting-started/quick-start.mdx`

- [ ] **Step 1: Insert the Aside component immediately after the `## Minimal example` heading**

The current file has:
```mdx
## Minimal example

```tsx
import { createHyperserveConfig } ...
```

Change it to:
```mdx
## Minimal example

<Aside type="note">
  This example uses the Hyperserve adapter — the recommended starting point. If you're uploading to a different backend, skip to [Custom Adapter](/adapters/custom-adapter/).
</Aside>

```tsx
import { createHyperserveConfig } ...
```

- [ ] **Step 2: Verify in browser**

Reload `http://localhost:4321/getting-started/quick-start/`. A blue/teal note callout box should appear between the "Minimal example" heading and the code block.

- [ ] **Step 3: Commit**

```bash
git add packages/docs/src/content/docs/getting-started/quick-start.mdx
git commit -m "docs(quick-start): add Hyperserve adapter callout block"
```

---

### Task 4: Add backend contract section

**Files:**
- Modify: `packages/docs/src/content/docs/getting-started/quick-start.mdx`

- [ ] **Step 1: Insert the backend contract section after "What's happening"**

The current file has "What's happening" followed by "## Composable layout". Insert a new section between them:

```mdx
All components read from the `UploadProvider` context. No prop drilling required.

## Backend routes

The three callbacks — `createUpload`, `completeUpload`, and `getVideoStatus` — must run server-side to keep your Hyperserve API key out of the browser. Here's the contract each route needs to implement:

| Route | Receives | Returns |
|---|---|---|
| `POST /api/create-upload` | `{ name: string, size: number, ...uploadOptions }` | `{ videoId: string }` |
| `POST /api/complete-upload/:id` | — | 204 / empty body |
| `GET /api/video-status/:id` | — | `{ status: string, ... }` |

<LinkCard
  title="Next.js guide"
  description="Full App Router implementation with all three routes."
  href="/guides/next-js/"
/>

## Composable layout
```

- [ ] **Step 2: Verify in browser**

Reload `http://localhost:4321/getting-started/quick-start/`. The "Backend routes" section should appear after "What's happening" with a rendered table and a link card pointing to the Next.js guide.

- [ ] **Step 3: Commit**

```bash
git add packages/docs/src/content/docs/getting-started/quick-start.mdx
git commit -m "docs(quick-start): add backend routes contract section"
```

---

### Task 5: Remove "Using a different adapter" section

**Files:**
- Modify: `packages/docs/src/content/docs/getting-started/quick-start.mdx`

This section is now redundant — the Hyperserve callout block added in Task 3 covers this with better placement.

- [ ] **Step 1: Delete the section**

Remove this block entirely (it appears after "Composable layout" and before "Try it locally"):

```mdx
## Using a different adapter

Replace `createHyperserveConfig` with a plain `UploadConfig` object and your own adapter. See [Custom Adapter](/guides/custom-adapter/) for a full walkthrough.
```

- [ ] **Step 2: Verify in browser**

Reload `http://localhost:4321/getting-started/quick-start/`. The "Using a different adapter" section should be gone. Confirm "Try it locally" still renders correctly at the bottom.

- [ ] **Step 3: Commit**

```bash
git add packages/docs/src/content/docs/getting-started/quick-start.mdx
git commit -m "docs(quick-start): remove redundant adapter section, covered by callout"
```

---

### Task 6: Final review

- [ ] **Step 1: Read through the full page in the browser**

Open `http://localhost:4321/getting-started/quick-start/` and scroll top to bottom. Verify:
- Intro paragraph and prerequisites appear at the top
- Blue note callout appears before the code block
- "What's happening" section is intact and unchanged
- "Backend routes" section has the table and a link card
- "Composable layout" section is intact and unchanged
- "Try it locally" section is intact and unchanged
- "Using a different adapter" section is gone

- [ ] **Step 2: Check the Custom Adapter link in the callout works**

Click the "Custom Adapter" link in the Aside. It should navigate to `/adapters/custom-adapter/`.

- [ ] **Step 3: Check the Next.js guide link card works**

Click the LinkCard in "Backend routes". It should navigate to `/guides/next-js/`.
