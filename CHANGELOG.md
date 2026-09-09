# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [video-uploader-adapter-hyperserve@0.1.3] — 2026-09-09

### Changed

- `@hyperserve/video-uploader-adapter-hyperserve` now requires
  `@hyperserve/hyperserve-js@^0.2.0`. The adapter's own API is unchanged and its
  build output is byte-identical to 0.1.2; only the bundled SDK moves. The
  adapter touches the SDK solely through `putVideoToStorage`, whose behavior on
  that path did not change in 0.2.0, so no adapter consumer has to change code.
- If you also call the Hyperserve SDK directly from your own backend, note that
  0.2.0 removes `fileSizeBytes` from `createVideo`; the API derives the size
  server-side. Drop the field from your `POST /api/create-upload` handler when
  you upgrade your own dependency. Releasing the adapter does not force that
  upgrade, since your backend depends on the SDK directly.

## [video-uploader-react@0.1.3, video-uploader-react-native@0.1.4] — 2026-08-11

### Fixed

- The `@hyperserve/video-uploader` peer dependency of `@hyperserve/video-uploader-react`
  and `@hyperserve/video-uploader-react-native` is a real semver range (`^0.1.2`)
  instead of `workspace:^`. The workspace protocol only resolves if the publisher
  rewrites it at pack time, so `video-uploader-react@0.1.2` and
  `video-uploader-react-native@0.1.3` shipped the literal string and failed every
  `npm install` with `EUNSUPPORTEDPROTOCOL`. Both bad versions have been
  unpublished. No other changes.
- `scripts/check-publish-manifests.ts` now runs in CI and blocks any workspace
  protocol or stale sibling range in a consumer-facing dependency block, and
  releases publish from CI rather than from a laptop.

## [0.1.1] — 2026-05-09

### Breaking changes

- `HyperserveConfig.getVideoStatus` renamed to `pollVideoStatus`. Mechanical rename.
- `updateFileStatus(id, status, playbackUrl?)` is now `updateFileStatus(id, status, data?)` where `data` is `StatusUpdateData = { playbackUrl?, thumbnailUri?, statusDetail? }`. For `updateFileStatus`, only `playbackUrl` and `thumbnailUri` are meaningful. Migration: wrap the URL in an object.
- `StatusChecker.onStatusChange` callback signature changed from `(status, playbackUrl?, statusDetail?)` to `(status, data?: StatusUpdateData)`. Only relevant if you implement a custom `StatusChecker`. `statusDetail` is now passed via `data.statusDetail` during processing.
- `pollVideoStatus` is no longer exported from `@hyperserve/video-uploader-adapter-hyperserve`. Use `HyperserveStatusChecker` directly.

### Behavior changes

- Files at `ready` retain their local thumbnail when no `playbackUrl` is provided. Previously the lib force-cleared `thumbnailUri` on every ready transition, which produced a placeholder fallthrough in `Thumbnail`.
- `updateFileStatus` may be called repeatedly on an already-ready file to patch `playbackUrl` or `thumbnailUri` after the initial flip.
- Local thumbnail blob URLs are revoked on `removeFile` and provider unmount only (not on the ready transition).

## [0.1.0] — 2026-04-22

### Added

- `@hyperserve/video-uploader` — headless upload state machine, validation, platform utilities
- `@hyperserve/video-uploader-react` — web UI components: DropZone, FileList, FileItem, ProgressBar, StatusBadge, Thumbnail, FileListToolbar
- `@hyperserve/video-uploader-react-native` — React Native UI components with the same compound component API
- `@hyperserve/video-uploader-adapter-hyperserve` — official Hyperserve adapter with signed URL upload and polling status checker
- `updateFileStatus` API on `useUpload()` for webhook/SSE-driven status transitions
- `DropZoneRenderProps` exported type for typed render function children
