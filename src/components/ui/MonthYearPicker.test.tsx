import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MonthYearPicker } from "./MonthYearPicker";

describe("MonthYearPicker", () => {
	it("changes date when selecting year and month", async () => {
		const user = userEvent.setup();
		const onDateChange = vi.fn();
		const date = new Date("2024-05-15T00:00:00Z");

		render(
			<MonthYearPicker
				date={date}
				onDateChange={onDateChange}
				fromYear={2023}
				toYear={2025}
			>
				<span>Open</span>
			</MonthYearPicker>,
		);

		await user.click(screen.getByRole("button", { name: "Open" }));

		await user.click(screen.getByRole("button", { name: "2025" }));
		await user.click(screen.getByRole("button", { name: "Feb" }));

		expect(onDateChange).toHaveBeenCalled();
		const calledDate = onDateChange.mock.calls[0][0] as Date;
		expect(calledDate.getFullYear()).toBe(2025);
		expect(calledDate.getMonth()).toBe(1);
	});
});
