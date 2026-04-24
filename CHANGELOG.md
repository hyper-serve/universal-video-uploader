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
