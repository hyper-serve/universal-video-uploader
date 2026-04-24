import { NextResponse } from "next/server";
import { hyperserve } from "../../../lib/hyperserve";

export async function POST(req: Request) {
	try {
		const {
			filename,
			fileSizeBytes,
			resolutions,
			isPublic,
			metadata,
			thumbnail,
		} = await req.json();

		const result = await hyperserve.createVideo({
			filename,
			fileSizeBytes,
			resolutions,
			isPublic,
			...(metadata && { customMetadata: metadata }),
			...(thumbnail && {
				thumbnailTimestampsSeconds: [thumbnail.timestampMs / 1000],
			}),
		});

		return NextResponse.json({
			videoId: result.id,
			uploadUrl: result.uploadUrl,
			contentType: result.contentType,
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : "Internal error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
