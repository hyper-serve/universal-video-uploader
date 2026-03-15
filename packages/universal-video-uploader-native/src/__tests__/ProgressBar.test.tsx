import React from "react";
import { render, screen } from "@testing-library/react-native";
import { ProgressBar } from "../ProgressBar";

describe("ProgressBar (native)", () => {
	it("renders with correct accessibility values", () => {
		render(<ProgressBar progress={42} />);
		const bar = screen.getByRole("progressbar");
		expect(bar.props.accessibilityValue).toEqual({
			max: 100,
			min: 0,
			now: 42,
		});
	});

	it("renders fill at 0%", () => {
		render(<ProgressBar progress={0} />);
		const bar = screen.getByRole("progressbar");
		expect(bar.props.accessibilityValue.now).toBe(0);
	});

	it("renders fill at 100%", () => {
		render(<ProgressBar progress={100} />);
		const bar = screen.getByRole("progressbar");
		expect(bar.props.accessibilityValue.now).toBe(100);
	});

	it("supports children render-prop", () => {
		const childFn = jest.fn((p: number) => <>{p}%</>);
		render(
			<ProgressBar progress={75}>
				{childFn}
			</ProgressBar>,
		);
		expect(childFn).toHaveBeenCalledWith(75);
	});
});
