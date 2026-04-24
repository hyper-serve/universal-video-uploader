export function filterFilesByAccept(files: File[], accept: string): File[] {
	if (!accept.trim()) return files;
	const tokens = accept
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
	return files.filter((file) =>
		tokens.some((token) => matchesAccept(file, token)),
	);
}

function matchesAccept(file: File, token: string): boolean {
	if (token.startsWith(".")) {
		const ext = token.toLowerCase();
		const name = file.name.toLowerCase();
		return name === ext || name.endsWith(ext);
	}
	const mime = token.toLowerCase();
	const type = (file.type || "").toLowerCase();
	if (mime.endsWith("/*")) {
		const prefix = mime.slice(0, -1);
		return Boolean(prefix && type.startsWith(prefix));
	}
	return type === mime;
}
