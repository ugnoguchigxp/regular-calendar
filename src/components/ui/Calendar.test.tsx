import { render, screen } from "@testing-library/react";
import { Calendar } from "./Calendar";

describe("Calendar", () => {
	it("renders month caption with locale formatting", () => {
		render(
			<Calendar
				mode="single"
				selected={new Date("2024-01-15T00:00:00Z")}
				defaultMonth={new Date("2024-01-01T00:00:00Z")}
			/>,
		);
		expect(
			screen.getByText((content) => content.includes("January 2024")),
		).toBeInTheDocument();
	});
});
