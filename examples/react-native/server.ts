import { HyperserveClient } from "@hyperserve/hyperserve-js";

const client = new HyperserveClient({
	apiKey: process.env.HYPERSERVE_API_KEY ?? "",
	baseUrl: process.env.HYPERSERVE_BASE_URL,
});

const PORT = 3001;

const cors = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

Bun.serve({
	port: PORT,
	async fetch(req) {
		const { pathname } = new URL(req.url);

		if (req.method === "OPTIONS") {
			return new Response(null, { status: 204, headers: cors });
		}

		try {
			if (req.method === "POST" && pathname === "/create-upload") {
				const {
					filename,
					fileSizeBytes,
					resolutions,
					isPublic,
					metadata,
					thumbnail,
				} = await req.json();
				const result = await client.createVideo({
					filename,
					fileSizeBytes,
					resolutions,
					isPublic,
					...(metadata && { customMetadata: metadata }),
					...(thumbnail && {
						thumbnailTimestampsSeconds: [thumbnail.timestampMs / 1000],
					}),
				});
				return Response.json(
					{
						videoId: result.id,
						uploadUrl: result.uploadUrl,
						contentType: result.contentType,
					},
					{ headers: cors },
				);
			}

			const completeMatch = pathname.match(/^\/complete-upload\/(.+)$/);
			if (req.method === "POST" && completeMatch) {
				await client.completeUpload(completeMatch[1]);
				return new Response(null, { status: 204, headers: cors });
			}

			const statusMatch = pathname.match(/^\/video-status\/(.+)$/);
			if (req.method === "GET" && statusMatch) {
				const video = await client.getVideo(statusMatch[1]);
				const status =
					video.status === "ready"
						? "ready"
						: video.status === "fail"
							? "failed"
							: "processing";
				const readyRes = Object.values(video.resolutions).find(
					(r) => r?.status === "ready" && r?.videoUrl,
				);
				return Response.json(
					{ status, playbackUrl: readyRes?.videoUrl },
					{ headers: cors },
				);
			}

			return new Response("Not found", { status: 404, headers: cors });
		} catch (err) {
			const message = err instanceof Error ? err.message : "Internal error";
			return Response.json({ error: message }, { status: 500, headers: cors });
		}
	},
});

console.log(`Server running at http://localhost:${PORT}`);
