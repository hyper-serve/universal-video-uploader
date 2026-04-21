import { NextResponse } from "next/server";
import { hyperserve } from "../../../../lib/hyperserve";

export async function POST(
	_req: Request,
	{ params }: { params: Promise<{ videoId: string }> },
) {
	try {
		const { videoId } = await params;
		await hyperserve.completeUpload(videoId);
		return new Response(null, { status: 204 });
	} catch (err) {
		const message = err instanceof Error ? err.message : "Internal error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
