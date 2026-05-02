import { Thumbnail } from "@hyperserve/video-uploader-react";
import { THUMB_URL, VIDEO_URL, mockFile } from "./mockFileState";

export default function ThumbnailPlaybackDemo() {
	return (
		<div
			className="not-content"
			style={{
				background: "#fff",
				border: "1px solid #e2e8f0",
				borderRadius: 8,
				padding: "1.5rem",
			}}
		>
			<Thumbnail
				file={mockFile({
					id: "playback-1",
					playbackUrl: VIDEO_URL,
					status: "ready",
					thumbnailUri: THUMB_URL,
				})}
				playback
			/>
		</div>
	);
}
