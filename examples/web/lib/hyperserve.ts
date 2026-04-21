import { HyperserveClient } from "@hyperserve/hyperserve-js";

export const hyperserve = new HyperserveClient({
	apiKey: process.env.HYPERSERVE_API_KEY ?? "",
	baseUrl: process.env.HYPERSERVE_BASE_URL,
});
