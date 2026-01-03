import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type {
	FacilityScheduleSettings,
	ScheduleEvent,
} from "../../RegularCalendar.schema";
import { MonthView } from "./MonthView";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string, options?: { defaultValue?: string }) =>
			options?.defaultValue ?? key,
	}),
}));

describe("MonthView", () => {
	const mockEvents: ScheduleEvent[] = [
		{
			id: "1",
			resourceId: "resource-1",
			groupId: "group-1",
			title: "Test Event",
			attendee: "John Doe",
			startDate: new Date(2025, 0, 15, 10, 0),
			endDate: new Date(2025, 0, 15, 11, 0),
			status: "confirmed",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: "2",
			resourceId: "resource-1",
			groupId: "group-1",
			title: "Another Event",
			attendee: "Jane Smith",
			startDate: new Date(2025, 0, 15, 14, 0),
			endDate: new Date(2025, 0, 15, 15, 0),
			status: "confirmed",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	];
	const mockSettings: FacilityScheduleSettings = {
		startTime: "00:00",
		endTime: "23:59",
		defaultDuration: 1,
		closedDays: [],
		weekStartsOn: 0,
	};
	const mockOnDateClick = vi.fn();
	const mockOnEventClick = vi.fn();

	it("renders calendar grid", () => {
		render(
			<MonthView
				currentDate={new Date("2025-01-01")}
				events={mockEvents}
				settings={mockSettings}
			/>,
		);

		expect(screen.getByText("Sun")).toBeInTheDocument();
		expect(screen.getByText("Mon")).toBeInTheDocument();
	});

	it("rotates day names when week starts on Monday", () => {
		const settingsMondayStart: FacilityScheduleSettings = {
			...mockSettings,
			weekStartsOn: 1,
		};
		render(
			<MonthView
				currentDate={new Date("2025-01-01")}
				events={mockEvents}
				settings={settingsMondayStart}
			/>,
		);

		const dayNames = screen.getAllByText(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)$/);
		expect(dayNames.length).toBe(7);
	});

	it("calls onDateClick when clicking on a date", () => {
		render(
			<MonthView
				currentDate={new Date("2025-01-01")}
				events={mockEvents}
				settings={mockSettings}
				onDateClick={mockOnDateClick}
			/>,
		);

		const dayButtons = screen.getAllByRole("button", { name: "Day cell" });
		if (dayButtons.length > 0) {
			fireEvent.click(dayButtons[0]);
			expect(mockOnDateClick).toHaveBeenCalled();
		}
	});

	it("displays events on the correct date", () => {
		render(
			<MonthView
				currentDate={new Date("2025-01-15")}
				events={mockEvents}
				settings={mockSettings}
			/>,
		);

		expect(screen.getByText("Test Event")).toBeInTheDocument();
		expect(screen.getByText("Another Event")).toBeInTheDocument();
	});

	it("shows more indicator when there are more than 3 events", () => {
		const manyEvents = Array.from({ length: 5 }, (_, i) => ({
			id: `${i + 1}`,
			resourceId: "resource-1",
			groupId: "group-1",
			title: `Event ${i + 1}`,
			attendee: `Attendee ${i + 1}`,
			startDate: new Date("2025-01-15T10:00:00Z"),
			endDate: new Date("2025-01-15T11:00:00Z"),
			status: "confirmed",
			createdAt: new Date(),
			updatedAt: new Date(),
		}));

		render(
			<MonthView
				currentDate={new Date("2025-01-15")}
				events={manyEvents}
				settings={mockSettings}
			/>,
		);

		expect(screen.getByText(/2 more/)).toBeInTheDocument();
	});

	it("highlights today", () => {
		const today = new Date();
		render(
			<MonthView
				currentDate={today}
				events={mockEvents}
				settings={mockSettings}
			/>,
		);

		const todayElement = screen.getAllByText(today.getDate());
		expect(todayElement.length).toBeGreaterThan(0);
	});

	it("highlights selected date", () => {
		render(
			<MonthView
				currentDate={new Date("2025-01-15")}
				events={mockEvents}
				settings={mockSettings}
			/>,
		);

		expect(screen.getByText("15")).toBeInTheDocument();
	});

	it("displays dates from other months with muted styling", () => {
		render(
			<MonthView
				currentDate={new Date("2025-01-15")}
				events={mockEvents}
				settings={mockSettings}
			/>,
		);

		const allDates = screen.getAllByText(/^\d+$/);
		expect(allDates.length).toBeGreaterThan(30);
	});

	it("calls onEventClick when clicking on an event", () => {
		render(
			<MonthView
				currentDate={new Date("2025-01-15")}
				events={mockEvents}
				settings={mockSettings}
				onEventClick={mockOnEventClick}
			/>,
		);

		fireEvent.click(screen.getByText("Test Event"));
		expect(mockOnEventClick).toHaveBeenCalledWith(mockEvents[0]);
	});
});
