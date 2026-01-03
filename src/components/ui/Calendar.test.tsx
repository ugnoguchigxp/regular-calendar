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
			screen.getByText((content) => content.includes("2024年") && content.includes("1月")),
		).toBeInTheDocument();
	});
});
