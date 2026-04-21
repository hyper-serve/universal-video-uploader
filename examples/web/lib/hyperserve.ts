import { HyperserveClient } from "@hyperserve/hyperserve-js";

export const hyperserve = new HyperserveClient({
	apiKey: process.env.HYPERSERVE_API_KEY ?? "",
});
