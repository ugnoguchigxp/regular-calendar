import { render, screen } from "@testing-library/react";
import { TimeGrid } from "./TimeGrid";

describe("TimeGrid", () => {
	it("renders time slots from start to end", () => {
		render(<TimeGrid startTime="08:00" endTime="12:00" />);
		expect(screen.getByText("08:00")).toBeInTheDocument();
		expect(screen.getByText("09:00")).toBeInTheDocument();
		expect(screen.getByText("10:00")).toBeInTheDocument();
		expect(screen.getByText("11:00")).toBeInTheDocument();
		expect(screen.queryByText("12:00")).not.toBeInTheDocument();
	});

	it("applies custom slot height", () => {
		const { container } = render(
			<TimeGrid startTime="08:00" endTime="10:00" slotSize={100} />,
		);
		const timeSlots = container.querySelectorAll(".border-b");
		const contentSlot = timeSlots[1];
		expect(contentSlot).toHaveStyle({ height: "100px" });
	});

	it("renders correct number of hours", () => {
		render(<TimeGrid startTime="00:00" endTime="24:00" />);
		const timeLabels = screen.getAllByText(/\d+:\d+/);
		expect(timeLabels).toHaveLength(24);
	});

	it("handles midnight to midnight range", () => {
		render(<TimeGrid startTime="00:00" endTime="24:00" />);
		expect(screen.getByText("00:00")).toBeInTheDocument();
		expect(screen.getByText("23:00")).toBeInTheDocument();
	});
});
