const MAX_BACKOFF_MS = 60_000;

function withJitter(ms: number): number {
	return ms + Math.random() * 0.3 * ms;
}

export function backoffDelay(
	intervalMs: number,
	consecutiveErrors: number,
): number {
	const delay = Math.min(
		intervalMs * Math.pow(2, consecutiveErrors),
		MAX_BACKOFF_MS,
	);
	return withJitter(delay);
}
