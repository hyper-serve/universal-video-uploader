import { hyperserve } from "../../../../lib/hyperserve";

export async function POST(
	_req: Request,
	{ params }: { params: Promise<{ videoId: string }> },
) {
	const { videoId } = await params;
	await hyperserve.completeUpload(videoId);
	return new Response(null, { status: 204 });
}
