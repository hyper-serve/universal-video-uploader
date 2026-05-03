import { NextResponse } from "next/server";
import { hyperserve } from "../../../lib/hyperserve";

export async function POST(req: Request) {
	try {
		const {
			filename,
			fileSizeBytes,
			resolutions,
			isPublic,
			custom_user_metadata,
			thumbnail_timestamps_seconds,
		} = await req.json();

		const result = await hyperserve.createVideo({
			filename,
			fileSizeBytes,
			isPublic,
			resolutions,
			...(custom_user_metadata && { customMetadata: custom_user_metadata }),
			...(thumbnail_timestamps_seconds && {
				thumbnailTimestampsSeconds: thumbnail_timestamps_seconds,
			}),
		});

		return NextResponse.json({
			contentType: result.contentType,
			uploadUrl: result.uploadUrl,
			videoId: result.id,
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : "Internal error";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
