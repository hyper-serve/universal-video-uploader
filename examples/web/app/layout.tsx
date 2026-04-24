import type { Metadata } from "next";

export const metadata: Metadata = {
	description: "Universal Video Uploader integration example",
	title: "Video Upload — Hyperserve",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body
				style={{
					background: "#f8fafc",
					fontFamily:
						'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
					margin: 0,
				}}
			>
				{children}
			</body>
		</html>
	);
}
