# @hyperserve/upload

Headless video upload state machine for React and React Native. Manages file queue, concurrency, validation, progress, and status polling. Bring your own UI or use `@hyperserve/upload-react` / `@hyperserve/upload-react-native`.

## Install

```bash
npm install @hyperserve/upload
```

## Usage

```tsx
import { UploadProvider, useUpload } from "@hyperserve/upload";

<UploadProvider config={config}>
  <YourUI />
</UploadProvider>

function YourUI() {
  const { files, addFiles } = useUpload();
  // ...
}
```

See the [full documentation](https://your-docs-url) for adapters, validators, and the headless guide.
