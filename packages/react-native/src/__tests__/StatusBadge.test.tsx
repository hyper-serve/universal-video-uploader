import type { FileStatus } from "@hyperserve/upload";
import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { StatusBadge } from "../StatusBadge.js";

describe("StatusBadge (native)", () => {
	it("renders default label for each status", () => {
		const statuses: Array<{ status: FileStatus; label: string }> = [
			{ label: "Selected", status: "selected" },
			{ label: "Validating", status: "validating" },
			{ label: "Uploading", status: "uploading" },
			{ label: "Processing", status: "processing" },
			{ label: "Ready", status: "ready" },
			{ label: "Failed", status: "failed" },
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
					ready: { bg: "#000", label: "Done!", text: "#fff" },
				}}
			/>,
		);
		expect(screen.getByText("Done!")).toBeTruthy();
	});

	it("uses getLabel over statusConfig label", () => {
		render(
			<StatusBadge
				getLabel={() => "Complete"}
				status="ready"
				statusConfig={{
					ready: { bg: "#000", label: "ignored", text: "#fff" },
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
