# Changelog

All notable changes to `@hyperserve/video-uploader-adapter-hyperserve` are
documented in this file. This project adheres to
[Semantic Versioning](https://semver.org).

## Unreleased

### Changed

- Require `@hyperserve/hyperserve-js@^0.2.0`. The SDK dropped `fileSizeBytes`
  from `createVideo`, so a backend that still sends it now fails to type-check.
  Drop the field from your `POST /api/create-upload` handler; nothing in the
  adapter's own API changes.

## [0.1.2] - 2026-06-04

### Changed

- Require `@hyperserve/hyperserve-js@^0.1.1`.

## [0.1.1] - earlier

- Initial published releases.
