import { render, screen } from "@testing-library/react";
import { CalendarGrid } from "./CalendarGrid";

describe("CalendarGrid", () => {
	it("renders month tiles from startDate to endDate (inclusive)", () => {
		render(
			<CalendarGrid
				startDate={new Date("2024-01-10T00:00:00Z")}
				endDate={new Date("2024-03-20T00:00:00Z")}
				locale="en-US"
			/>,
		);

		expect(screen.getByText(/Jan 2024/i)).toBeInTheDocument();
		expect(screen.getByText(/Feb 2024/i)).toBeInTheDocument();
		expect(screen.getByText(/Mar 2024/i)).toBeInTheDocument();
	});

	it("hides navigation controls in preview mode", () => {
		render(
			<CalendarGrid
				startDate={new Date("2024-01-01T00:00:00Z")}
				endDate={new Date("2024-02-01T00:00:00Z")}
				locale="en-US"
			/>,
		);

		expect(
			screen.queryByRole("button", { name: /Go to previous month/i }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /Go to next month/i }),
		).not.toBeInTheDocument();
	});

	it("uses default responsive column classes", () => {
		const { container } = render(
			<CalendarGrid
				startDate={new Date("2024-01-01T00:00:00Z")}
				endDate={new Date("2024-01-01T00:00:00Z")}
			/>,
		);

		expect(container.firstChild).toHaveClass(
			"grid-cols-1",
			"sm:grid-cols-2",
			"lg:grid-cols-3",
			"xl:grid-cols-4",
		);
	});
});
