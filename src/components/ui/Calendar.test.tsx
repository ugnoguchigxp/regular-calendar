import { render, screen } from "@testing-library/react";
import { Calendar } from "./Calendar";

describe("Calendar", () => {
	it("renders month caption with default locale formatting (English)", () => {
		render(
			<Calendar
				mode="single"
				locale="en-US"
				selected={new Date("2024-01-15T00:00:00Z")}
				defaultMonth={new Date("2024-01-01T00:00:00Z")}
			/>,
		);
		expect(
			screen.getByText((content) => content.includes("Jan 2024")),
		).toBeInTheDocument();
	});

	it("renders month caption with Japanese locale formatting", () => {
		render(
			<Calendar
				mode="single"
				locale="ja-JP"
				selected={new Date("2024-01-15T00:00:00Z")}
				defaultMonth={new Date("2024-01-01T00:00:00Z")}
			/>,
		);
		expect(
			screen.getByText(
				(content) => content.includes("2024年") && content.includes("1月"),
			),
		).toBeInTheDocument();
	});

	it("renders multiple months when numberOfMonths is set", () => {
		render(
			<Calendar
				mode="single"
				locale="en-US"
				selected={new Date("2024-01-15T00:00:00Z")}
				defaultMonth={new Date("2024-01-01T00:00:00Z")}
				numberOfMonths={2}
			/>,
		);

		expect(
			screen.getByText((content) => content.includes("Jan 2024")),
		).toBeInTheDocument();
		expect(
			screen.getByText((content) => content.includes("Feb 2024")),
		).toBeInTheDocument();
	});

	it("hides navigation controls when disableNavigation is true", () => {
		render(
			<Calendar
				mode="single"
				locale="en-US"
				selected={new Date("2024-01-15T00:00:00Z")}
				defaultMonth={new Date("2024-01-01T00:00:00Z")}
				disableNavigation
			/>,
		);

		expect(
			screen.queryByRole("button", { name: /Go to previous month/i }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /Go to next month/i }),
		).not.toBeInTheDocument();
	});

	it("applies highlighted style to highlightedDates", () => {
		render(
			<Calendar
				mode="single"
				locale="en-US"
				defaultMonth={new Date("2024-01-01T00:00:00Z")}
				highlightedDates={[new Date("2024-01-15T00:00:00Z")]}
			/>,
		);

		const highlightedCandidates = screen.getAllByRole("button", {
			name: /^15$/,
		});
		expect(
			highlightedCandidates.some((button) =>
				button.className.includes("ring-2"),
			),
		).toBe(true);
	});
});
