# Release Prep Design — v0.1.0

> Date: 2026-04-22
> Scope: Pre-publish preparation for all 4 packages + docs site + open source setup

---

## Overview

Get the `universal-video-uploader` monorepo into a publishable state for `v0.1.0`. This covers a missing API implementation, package publish configuration, documentation gaps, and open source scaffolding. No `npm publish` is part of this plan — that is a separate step.

**Packages in scope:**
- `@hyperserve/upload` (core)
- `@hyperserve/upload-react`
- `@hyperserve/upload-react-native`
- `@hyperserve/upload-adapter-hyperserve`

**Out of scope:**
- Mux adapter (intentionally removed)
- Expo Snack RN demo (separate spec: `2026-04-22-expo-snack-rn-demo-design.md`)
- `npm publish` / registry push

---

## Section 1: Code — `updateFileStatus`

**Why:** Consumers who skip `statusChecker` (preferring webhooks or SSE) currently have no way to transition a file out of `"processing"`. The file is stuck there forever.

**Changes:**

### `packages/core/src/types.ts`

Add to `UploadContextValue`:

```typescript
updateFileStatus: (
  videoId: string,
  status: "ready" | "failed",
  playbackUrl?: string,
) => void;
```

### `packages/core/src/context.tsx`

Implement `updateFileStatus`:
- Find file by `videoId` in state
- No-op if file is not found or not in `"processing"` status
- Transition to `"ready"` or `"failed"`
- Set `playbackUrl` if provided (only meaningful for `"ready"`)

### `packages/core/src/__tests__/context.test.tsx`

New test cases:
- Transitions `"processing"` → `"ready"` with `playbackUrl`
- Transitions `"processing"` → `"failed"`
- No-ops when file is not in `"processing"`
- No-ops for unknown `videoId`

### `docs/ARCHITECTURE.md`

Add a short paragraph to the StatusChecker section explaining the two paths:
> Provide a `statusChecker` for automatic polling, or omit it and call `updateFileStatus(videoId, status, playbackUrl?)` directly from a webhook handler, SSE listener, or WebSocket message.

---

## Section 2: Package Prep

**Why:** All packages are at `0.0.1` and missing standard npm publish fields. Scoped packages require `publishConfig.access: "public"`.

### For each of the 4 packages

Bump `"version"` from `"0.0.1"` → `"0.1.0"`.

Verify or add:
- `"exports"` — proper `import` / `require` / `types` conditions pointing into `dist/`
- `"files"` — `["dist"]`, excluding src, tests, and config files
- `"publishConfig": { "access": "public" }` — required for scoped packages on the public registry
- `"repository"` — GitHub URL
- `"license": "MIT"`
- `"keywords"` — relevant terms for discoverability

### `README.md` (root)

Replace `"TODO"` with:
- One-paragraph description of what the library is
- Install commands for each package
- Minimal usage snippet (UploadProvider + adapter + a component)
- Link to the docs site

### Per-package `README.md`

Each of the 4 packages needs its own `README.md` — npm displays it on the package page. Each should be brief:
- One sentence describing what the package is and its role
- Install command
- Minimal usage snippet or pointer to the relevant part of the full docs
- Link to the docs site

---

## Section 3: Documentation

### `docs/ARCHITECTURE.md`

Add the following (do not add any Mux-specific content):

**Utility functions section** — brief descriptions of:
- `toFileRef` / `toFileRefs` — convert a browser `File` or RN `DocumentPickerResult` to `FileRef`
- `revokeFileRef` — revoke the object URL on a web `FileRef` when done
- `revokeThumbnail` — manually revoke a thumbnail blob URL (web only)

**Thumbnail lifecycle section** — one sentence for `revokeThumbnail`.

**HyperserveUploadOptions** — add `thumbnail.timestampMs` to the options description.

**StatusChecker section** — add the two-path note from Section 1.

### Docs site (`packages/docs`)

- **Adapter / config reference** — add `HyperserveStatusChecker` default polling interval (3000ms)
- **Quick-start or adapter setup guide** — add config memoization note: the result of `createHyperserveConfig` should be stable across renders (created at module level or wrapped in `useMemo`)
- **HyperserveUploadOptions reference** — add `thumbnail.timestampMs` field

`custom-backend.mdx` — leave as-is. The `MuxAdapter` / `MuxStatusChecker` pseudocode is a fictional illustration of the adapter pattern; no changes needed and no new Mux references to be added.

**`DropZone` render prop typing** — the `children` render prop interface already includes `openPicker` internally but `DropZoneProps` doesn't surface it clearly in the exported type. Add an explicit `DropZoneRenderProps` type:

```typescript
type DropZoneRenderProps = {
  isDragging: boolean;
  openPicker: () => void;
};
```

Export it from `@hyperserve/upload-react` and use it as the `children` signature in `DropZoneProps`. Document it on the `drop-zone.mdx` docs page.

---

## Section 4: Pre-Publish Verification

Run before declaring the branch ready:

1. **Tests** — `bun run test` (per-package filters) — all pass
2. **Build** — `bun run build` — all 4 packages produce clean `dist/` output
3. **Type check** — `tsc --noEmit` across all packages
4. **Lint** — `biome lint` — no errors
5. **Format** — `biome format` — no diff
6. **Docs build** — `bun run docs:build` — builds without errors
7. **Package fields** — manually verify `package.json` exports resolve correctly for both ESM and CJS consumers

---

## Section 5: Open Source Setup

### Markdown files (root)

**`CONTRIBUTING.md`**
- Prerequisites and dev setup (`bun install`, `bun run build`)
- How to run tests, lint, format, type check
- Branch and PR workflow
- PR title must follow conventional commit format (enforced by CI): `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `build:`
- Individual commits are not required to follow any format (squash merge policy)

**`CODE_OF_CONDUCT.md`**
- Contributor Covenant v2.1 (standard boilerplate)

**`SECURITY.md`**
- How to report vulnerabilities privately (GitHub private advisory or email)
- Response SLA expectation

**`CHANGELOG.md`**
- Keep a Changelog format
- Stub `0.1.0` entry with initial release notes

### GitHub Actions (`.github/workflows/`)

**`ci.yml`** — triggers on `pull_request` targeting `main` (types: opened, synchronize, reopened). Direct pushes to `main` are blocked by branch protection; no push trigger needed.
```
jobs:
  check:
    - bun install
    - bun run build
    - tsc --noEmit (all packages)
    - biome lint
    - biome format (check only)
    - bun run test (per-package filters)
```

**`pr-title.yml`** — triggers on `pull_request` targeting `main` (types: opened, edited, synchronize):
- Validates PR title matches conventional commit regex
- Fails with a clear message if the title doesn't conform

### Pre-push hook (`lefthook.yml`)

Runs locally before `git push`, same three checks as CI (no test run — tests are CI's job):
```yaml
pre-push:
  commands:
    type-check:
      run: tsc --noEmit
    lint:
      run: biome lint
    format:
      run: biome format
```

Lefthook added as a dev dependency in the root `package.json`. Install instructions added to `CONTRIBUTING.md`.

---

## Implementation Order

1. `updateFileStatus` implementation + tests
2. `DropZoneRenderProps` type + export + docs update
3. Package version bumps + publish field verification
4. Root README + per-package READMEs
5. ARCHITECTURE.md additions
6. Docs site content gaps
7. Open source markdown files
8. GitHub Actions workflows
9. Lefthook pre-push hook
10. Pre-publish verification pass
