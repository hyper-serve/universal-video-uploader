# @hyperserve/upload-react-native

Composable React Native UI components for `@hyperserve/upload`. Includes FilePicker, FileList, FileItem, ProgressBar, StatusBadge, Thumbnail, and FileListToolbar.

## Install

```bash
npm install @hyperserve/upload @hyperserve/upload-react-native
```

## Usage

```tsx
import { FilePicker, FileList } from "@hyperserve/upload-react-native";
import { UploadProvider } from "@hyperserve/upload";
import * as DocumentPicker from "expo-document-picker";
import { toFileRefs } from "@hyperserve/upload";

<UploadProvider config={config}>
  <FilePicker
    pickFiles={async () => {
      const result = await DocumentPicker.getDocumentAsync({ type: "video/*", multiple: true });
      return result.canceled ? [] : toFileRefs(result.assets);
    }}
  />
  <FileList />
</UploadProvider>
```

See the [full documentation](https://your-docs-url).
