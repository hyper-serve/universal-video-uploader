import type { UploadConfig } from "@hyperserve/universal-video-uploader";

export const CONFIG: Pick<UploadConfig, "apiKey" | "baseUrl"> = {
	apiKey: "YOUR_HYPERSERVE_API_KEY",
	baseUrl: "https://api.hyperserve.io/v1",
};
