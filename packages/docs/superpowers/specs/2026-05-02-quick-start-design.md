# Quick Start Page Redesign

**Date:** 2026-05-02  
**Scope:** `packages/docs/src/content/docs/getting-started/quick-start.mdx` only

---

## Goal

The quick-start page currently drops readers into a code block with no orientation. Three things are missing:
1. An intro telling readers what they're about to build and whether they're ready
2. A clear signal that the example is Hyperserve-specific, with an escape hatch for other backends
3. An explanation of what the backend routes need to do (the contract, not an implementation)

---

## Page Structure

The page keeps its existing sections in the same order. Three additions are inserted:

### 1. Intro (new — top of page, before any heading)

One sentence describing what the page does, followed by a short prerequisites list:

```
This guide gets you from zero to a working video upload UI in about 20 lines of React.

**Prerequisites**
- React 18+
- Packages installed (see Installation)
- A Hyperserve account and API key (for the example below)
```

### 2. Hyperserve callout block (new — before the "Minimal example" heading)

A Starlight `<Aside type="note">` that frames the adapter choice before the reader sees any code:

```
This example uses the Hyperserve adapter — the recommended starting point.
If you're uploading to a different backend, skip to Custom Adapter.
```

### 3. Minimal example (existing — unchanged)

The existing `createHyperserveConfig` + JSX code block. No changes.

### 4. What's happening (existing — unchanged)

The existing numbered explanation of each component. No changes.

### 5. Backend contract (new — after "What's happening")

A short paragraph explaining the client/server split, followed by a contract table, followed by a LinkCard to the Next.js guide.

**Paragraph:**
```
The three callbacks — createUpload, completeUpload, and getVideoStatus — must run 
server-side to keep your Hyperserve API key out of the browser. Here's the contract 
each route needs to implement:
```

**Table:**

| Route | Receives | Returns |
|---|---|---|
| `POST /api/create-upload` | `{ name, size, ...uploadOptions }` | `{ videoId: string }` |
| `POST /api/complete-upload/:id` | — | 204 / empty body |
| `GET /api/video-status/:id` | — | `{ status: string, ... }` |

**LinkCard:** Points to `/guides/next-js/` with label "Next.js guide — full App Router implementation with all three routes."

### 6. Composable layout (existing — unchanged)

### 7. Try it locally (existing — unchanged)

---

## What is not changing

- No backend route code on this page — that belongs in the Next.js guide
- No restructuring into numbered steps or tabbed sections
- No changes to the Installation page or the Next.js guide (out of scope)
- The "Using a different adapter" section at the bottom is removed — it's now covered by the Hyperserve callout block at the top

---

## Components used

- `<Aside type="note">` from `@astrojs/starlight/components` — for the Hyperserve callout
- `<LinkCard>` from `@astrojs/starlight/components` — already imported in many pages, for the Next.js guide link
- Standard markdown table — for the backend contract
