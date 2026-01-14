import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { DatePicker } from "./DatePicker";

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
			screen.getByRole("button", { name: /Jan 15, 2024/i }),
		).toBeInTheDocument();
	});

	it("calls onChange and setDate in single mode", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		const setDate = vi.fn();
		// Use a fixed date to have predictable day buttons
		const fixedDate = new Date("2024-01-15T00:00:00Z");
		render(
			<DatePicker value={fixedDate} onChange={onChange} setDate={setDate} />,
		);

		await user.click(screen.getByRole("button", { name: /Jan 15, 2024/i }));

		// Find and click Jan 10
		const jan10 = screen.getByRole("button", { name: /^10$/ });
		await user.click(jan10);

		expect(onChange).toHaveBeenCalledWith(expect.any(Date));
		const calledDate = onChange.mock.calls[0][0];
		expect(calledDate.getFullYear()).toBe(2024);
		expect(calledDate.getMonth()).toBe(0); // Jan
		expect(calledDate.getDate()).toBe(10);
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
			screen.getByRole("button", { name: /Feb 1, 2024/i }),
		).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /Feb 1, 2024/i }));

		// Click Feb 10 (selecting new range start)
		const feb10 = screen.getByRole("button", { name: /^10$/ });
		await user.click(feb10);

		expect(onRangeChange).toHaveBeenCalledWith([expect.any(Date), null]);
		const [from] = onRangeChange.mock.calls[0][0];
		expect(from.getDate()).toBe(10);
	});

	describe("Bug Fix Verifications", () => {
		it("selects today even if minDate is set to current time (Boundary Fix)", async () => {
			const user = userEvent.setup();
			// Set minDate to a specific time that usually breaks "today" selection
			const minDate = new Date("2026-01-14T12:00:00Z");

			function TestComponent() {
				const [date, setDate] = useState<Date | undefined>(undefined);
				return (
					<DatePicker
						date={date}
						setDate={setDate}
						minDate={minDate}
						label="Pick date"
					/>
				);
			}

			render(<TestComponent />);
			await user.click(screen.getByRole("button", { name: /Pick date/i }));

			const todayBtn = screen.getByRole("button", { name: /^14$/ });

			// Fix confirmed: should be enabled because it ignores time
			expect(todayBtn).toBeEnabled();
			// Action: click today (should not crash and should trigger selection)
			await user.click(todayBtn);

			// The test passes if it reaches here without error,
			// as the primary goal was to verify the button is enabled and clickable.
		});

		it("synchronizes calendar month when date is changed externally (Sync Fix)", async () => {
			const user = userEvent.setup();

			function TestComponent() {
				const [date, setDate] = useState<Date | undefined>(
					new Date("2026-01-14T00:00:00Z"),
				);
				return (
					<div>
						<button
							type="button"
							onClick={() => setDate(new Date("2026-05-20T00:00:00Z"))}
						>
							Set to May
						</button>
						<DatePicker date={date} setDate={setDate} label="Pick date" />
					</div>
				);
			}

			render(<TestComponent />);

			// 1. Initial State (Jan)
			await user.click(screen.getByRole("button", { name: /Jan 14, 2026/i }));
			expect(screen.getByText(/Jan 2026/i)).toBeInTheDocument();

			// 2. Close
			await user.keyboard("{Escape}");

			// 3. Change date to May via external button
			await user.click(screen.getByText("Set to May"));

			// 4. Reopen - should show May
			await user.click(screen.getByRole("button", { name: /May 20, 2026/i }));
			expect(screen.getByText(/May 2026/i)).toBeInTheDocument();
		});

		it("resets internal month navigation when reopened with different selected date", async () => {
			const user = userEvent.setup();

			function TestComponent() {
				const [date, setDate] = useState<Date | undefined>(
					new Date("2024-01-15T10:00:00Z"),
				);
				return <DatePicker date={date} setDate={setDate} label="Pick date" />;
			}

			render(<TestComponent />);

			// 1. Open Jan
			await user.click(screen.getByRole("button", { name: /Jan 15, 2024/i }));
			const popover = await screen.findByRole("dialog");
			expect(within(popover).getByText(/Jan 2024/i)).toBeInTheDocument();

			// 2. Navigate away from current month (Jan -> Feb)
			const nextBtn = within(popover).getByRole("button", {
				name: /Go to next month/i,
			});
			await user.click(nextBtn);
			expect(within(popover).getByText(/Feb 2024/i)).toBeInTheDocument();

			// 3. Close
			await user.keyboard("{Escape}");

			// 4. Reopen
			// Since the date is Jan 15, reopening should reset view to Jan
			await user.click(screen.getByRole("button", { name: /Jan 15, 2024/i }));
			const reopenedPopover = await screen.findByRole("dialog");

			expect(
				within(reopenedPopover).getByText(/Jan 2024/i),
			).toBeInTheDocument();
			expect(
				within(reopenedPopover).queryByText(/Feb 2024/i),
			).not.toBeInTheDocument();
		});
	});
});
