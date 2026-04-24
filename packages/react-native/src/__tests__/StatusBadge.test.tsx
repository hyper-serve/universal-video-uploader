import { Text } from "react-native";
import { render, screen } from "@testing-library/react-native";
import { StatusBadge } from "../StatusBadge";
import type { FileStatus } from "@hyperserve/upload";

describe("StatusBadge (native)", () => {
	it("renders default label for each status", () => {
		const statuses: Array<{ status: FileStatus; label: string }> = [
			{ status: "selected", label: "Selected" },
			{ status: "validating", label: "Validating" },
			{ status: "uploading", label: "Uploading" },
			{ status: "processing", label: "Processing" },
			{ status: "ready", label: "Ready" },
			{ status: "failed", label: "Failed" },
		];

		for (const { status, label } of statuses) {
			const { unmount } = render(<StatusBadge status={status} />);
			expect(screen.getByText(label)).toBeTruthy();
			unmount();
		}
	});

	it("allows overriding label via statusConfig", () => {
		render(
			<StatusBadge
				status="ready"
				statusConfig={{
					ready: { label: "Done!", bg: "#000", text: "#fff" },
				}}
			/>,
		);
		expect(screen.getByText("Done!")).toBeTruthy();
	});

	it("uses getLabel over statusConfig label", () => {
		render(
			<StatusBadge
				status="ready"
				getLabel={() => "Complete"}
				statusConfig={{
					ready: { label: "ignored", bg: "#000", text: "#fff" },
				}}
			/>,
		);
		expect(screen.getByText("Complete")).toBeTruthy();
	});

	it("supports children render-prop", () => {
		// biome-ignore lint/correctness/noUnusedFunctionParameters: color destructured to verify shape, not used in render
		const childFn = jest.fn(({ label, color }) => (
			<Text testID="custom-label">{label}</Text>
		));
		render(<StatusBadge status="failed">{childFn}</StatusBadge>);
		expect(childFn).toHaveBeenCalledWith(
			expect.objectContaining({ label: "Failed" }),
		);
		expect(screen.getByTestId("custom-label")).toBeTruthy();
	});
});
