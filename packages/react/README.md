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
