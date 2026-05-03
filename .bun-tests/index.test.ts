import { expect, test } from "bun:test";
import path from "node:path";
import { spawnSync } from "bun";

test("workspace tests", () => {
	const result = spawnSync(["bun", "run", "test"], {
		cwd: path.resolve(import.meta.dir, ".."),
		stderr: "inherit",
		stdout: "inherit",
	});
	expect(result.exitCode).toBe(0);
});
