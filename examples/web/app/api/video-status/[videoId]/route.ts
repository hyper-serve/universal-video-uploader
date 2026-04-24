import { NextResponse } from "next/server";
import { hyperserve } from "../../../../lib/hyperserve";

export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ videoId: string }> },
) {
	try {
		const { videoId } = await params;
		const video = await hyperserve.getVideo(videoId);

		const status =
			video.status === "ready"
				? "ready"
				: video.status === "fail"
					? "failed"
					: "processing";

		const readyRes = Object.values(video.resolutions).find(
			(r) => r?.status === "ready" && r?.videoUrl,
		);

		return NextResponse.json({ playbackUrl: readyRes?.videoUrl, status });
	} catch (err) {
		const message = err instanceof Error ? err.message : "Internal error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
