import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DatePicker } from "./DatePicker";

type MockCalendarSelect =
	| Date
	| {
			from: Date;
			to: Date;
	  };

vi.mock("./Calendar", () => ({
	Calendar: ({
		onSelect,
		mode,
	}: {
		onSelect?: (value: MockCalendarSelect) => void;
		mode?: string;
	}) => (
		<button
			type="button"
			onClick={() =>
				onSelect?.(
					mode === "range"
						? {
								from: new Date("2024-02-01T00:00:00Z"),
								to: new Date("2024-02-03T00:00:00Z"),
							}
						: new Date("2024-01-10T00:00:00Z"),
				)
			}
		>
			Pick
		</button>
	),
}));

describe("DatePicker", () => {
	it("renders label when no value is selected", () => {
		render(<DatePicker label="Pick date" />);
		expect(
			screen.getByRole("button", { name: /Pick date/i }),
		).toBeInTheDocument();
	});

	it("renders formatted single date", () => {
		render(<DatePicker value={new Date("2024-01-15T00:00:00Z")} />);
		expect(
			screen.getByRole("button", { name: /January 15th, 2024/i }),
		).toBeInTheDocument();
	});

	it("calls onChange and setDate in single mode", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		const setDate = vi.fn();
		render(<DatePicker onChange={onChange} setDate={setDate} />);

		await user.click(screen.getByRole("button", { name: /Select date/i }));
		await user.click(screen.getByRole("button", { name: "Pick" }));

		expect(onChange).toHaveBeenCalledWith(new Date("2024-01-10T00:00:00Z"));
		expect(setDate).toHaveBeenCalledWith(new Date("2024-01-10T00:00:00Z"));
	});

	it("renders formatted range date and calls onRangeChange", async () => {
		const user = userEvent.setup();
		const onRangeChange = vi.fn();
		render(
			<DatePicker
				selectsRange
				startDate={new Date("2024-02-01T00:00:00Z")}
				endDate={new Date("2024-02-03T00:00:00Z")}
				onRangeChange={onRangeChange}
			/>,
		);

		expect(
			screen.getByRole("button", { name: /February 1st, 2024/i }),
		).toBeInTheDocument();

		await user.click(
			screen.getByRole("button", { name: /February 1st, 2024/i }),
		);
		await user.click(screen.getByRole("button", { name: "Pick" }));

		expect(onRangeChange).toHaveBeenCalledWith([
			new Date("2024-02-01T00:00:00Z"),
			new Date("2024-02-03T00:00:00Z"),
		]);
	});
});
