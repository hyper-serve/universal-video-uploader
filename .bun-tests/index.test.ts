import { test, expect } from "bun:test";
import { spawnSync } from "bun";
import path from "node:path";

test("workspace tests", () => {
	const result = spawnSync(["bun", "run", "test"], {
		cwd: path.resolve(import.meta.dir, ".."),
		stdout: "inherit",
		stderr: "inherit",
	});
	expect(result.exitCode).toBe(0);
});
