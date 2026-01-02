import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ViewSelector } from "./ViewSelector";

describe("ViewSelector", () => {
	it("renders options and calls onViewChange", async () => {
		const user = userEvent.setup();
		const onViewChange = vi.fn();
		render(
			<ViewSelector
				currentView="month"
				onViewChange={onViewChange}
				options={[
					{ value: "day", label: "Day" },
					{ value: "week", label: "Week" },
					{ value: "month", label: "Month" },
				]}
			/>,
		);

		expect(screen.getByRole("button", { name: "Day" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Week" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Month" })).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Week" }));
		expect(onViewChange).toHaveBeenCalledWith("week");
	});
});
