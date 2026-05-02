# React Native Docs Restructure

**Date:** 2026-05-02

## Problem

`guides/react-native.mdx` is misplaced. It contains setup concepts (platform resolution, FileRef type, component mapping) — not a guide or example. The Guides section should be purely example-driven (Next.js, Expo). The sidebar already labels it "Setup: React Native," acknowledging the mismatch.

## Decision

Move the page to `getting-started/react-native.mdx` and trim the inline example, which duplicates the Expo guide.

## Changes

### 1. Move and trim the page
- Move `packages/docs/src/content/docs/guides/react-native.mdx` → `packages/docs/src/content/docs/getting-started/react-native.mdx`
- Update frontmatter title/description as needed
- Remove the "Example" section (covered by `guides/expo.mdx`)
- Keep: platform resolution table, FileRef type, component comparison table

### 2. Update sidebar (`packages/docs/astro.config.mjs`)
- Add to Getting Started: `{ label: "React Native", slug: "getting-started/react-native" }`
- Remove from Guides: `{ label: "Setup: React Native", slug: "guides/react-native" }`

### 3. Update LinkCard (`packages/docs/src/content/docs/getting-started/installation.mdx`)
- Change href from `/guides/react-native/` to `/getting-started/react-native/`

## Result

- Getting Started: Installation, Quick Start, React Native
- Guides: Example: Next.js, Example: Expo
- Installation page LinkCard points to the new location
