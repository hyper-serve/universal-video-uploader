# Expo Snack RN Demo — Docs Integration

> Date: 2026-04-22
> Scope: Embed a live React Native demo in the docs site using Expo Snack

---

## Overview

Embed an interactive Expo Snack in the React Native guide page (`guides/react-native.mdx`) so readers can see the library working in RN without cloning the repo.

**Constraint:** Expo Go and Expo Snack don't support custom native modules. `react-native-background-upload` (used for real background upload progress in the full example) won't run. The Snack demo must use the fetch-fallback path — functional upload with coarse progress, not true background upload.

The full working native example with real background upload remains in `examples/react-native/`. The Snack is a "try it" entry point, not a replacement.

---

## What the Snack Shows

A minimal but complete upload flow:
- `FilePicker` to select a video
- `FileList` to show upload state and progress
- `HyperserveAdapter` configured against a **mock/stub backend** (returns fake upload URL, no real upload happens in the Snack)
- File transitions through `selected → uploading → ready`

The mock backend stub is inlined in the Snack — a small function that resolves immediately with a fake `videoId` and `uploadUrl`. This makes the demo self-contained with no external service dependency.

A banner or callout on the docs page clarifies:
> This demo runs on a mock backend and uses the fetch-based upload fallback. For real background upload on native, see the full example in `examples/react-native/`.

---

## Implementation

### 1. Snack source

Create `packages/docs/src/content/docs/guides/react-native-snack/` containing the Snack source files:

```
App.tsx          — root component with UploadProvider + FilePicker + FileList
mock-adapter.ts  — inline mock that fakes createUpload/completeUpload
package.json     — Snack package manifest listing @hyperserve/* deps
```

**`mock-adapter.ts`** — returns a fake signed URL that points at a real file (or an endpoint that accepts and discards the PUT) so the upload phase actually runs and progress is visible. Alternatively, intercept the upload with a no-op. Decision: use a real public PUT endpoint (e.g. `https://httpbin.org/put`) so progress tracking is real and the demo feels authentic.

**`App.tsx`** — minimal, no custom theming, no ViewModeProvider complexity. Just enough to show the file lifecycle.

### 2. Snack embed in docs

Expo Snack supports embedding via iframe or the `@expo/snack-sdk`. The simplest approach is a direct Snack URL embed:

```
https://snack.expo.dev/?files=<encoded-files>&platform=ios&preview=true
```

Alternatively, publish the Snack via the Expo Snack API and embed the resulting `snack.expo.dev/<id>` URL. Publishing gives a stable URL that isn't URL-length-limited.

**Recommended:** publish the Snack once and embed the stable URL. The published Snack can be updated by re-publishing when the API changes.

### 3. Docs page update

In `guides/react-native.mdx`:
- Add an `<iframe>` embed of the published Snack (height ~600px)
- Add a callout explaining the fetch-fallback and mock backend
- Link to `examples/react-native/` for the full native experience

An Astro component (`SnackEmbed.astro`) wraps the iframe with consistent sizing and a fallback link for readers who block iframes.

---

## Out of Scope

- Making `react-native-background-upload` work in Expo Go — not possible without custom dev client
- Full Hyperserve backend integration in the Snack — mock is sufficient for a docs demo
- Expo Go QR code scanning flow — the iframe embed covers the primary docs use case

---

## Implementation Order

1. Write `mock-adapter.ts` and `App.tsx` Snack source files
2. Test locally in Expo Go via Snack CLI or the web editor
3. Publish Snack and capture stable URL
4. Create `SnackEmbed.astro` component
5. Update `guides/react-native.mdx` with embed + callout
6. Verify docs build passes with the new component
