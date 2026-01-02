import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
	FacilityScheduleSettings,
	ScheduleEvent,
} from "../../RegularCalendar.schema";
import { WeekView } from "./WeekView";

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

global.ResizeObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	disconnect: vi.fn(),
}));

describe("WeekView", () => {
	const mockEvents: ScheduleEvent[] = [
		{
			id: "1",
			resourceId: "resource-1",
			groupId: "group-1",
			title: "Test Event",
			attendee: "John Doe",
			startDate: new Date("2025-01-15T10:00:00Z"),
			endDate: new Date("2025-01-15T11:00:00Z"),
			status: "confirmed",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			id: "2",
			resourceId: "resource-1",
			groupId: "group-1",
			title: "All Day Event",
			attendee: "Jane Smith",
			startDate: new Date("2025-01-15T00:00:00Z"),
			endDate: new Date("2025-01-16T00:00:00Z"),
			status: "confirmed",
			isAllDay: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	];
	const mockSettings: FacilityScheduleSettings = {
		startTime: "00:00",
		endTime: "23:59",
		defaultDuration: 0.5,
		closedDays: [],
		weekStartsOn: 0,
	};
	const mockOnEventClick = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders week view with date header", () => {
		render(
			<WeekView
				currentDate={new Date("2025-01-15")}
				events={mockEvents}
				settings={mockSettings}
			/>,
		);

		expect(screen.getByText("days_short_sun")).toBeInTheDocument();
		expect(screen.getByText("days_short_mon")).toBeInTheDocument();
	});

	it("renders time slots", () => {
		render(
			<WeekView
				currentDate={new Date("2025-01-15")}
				events={mockEvents}
				settings={mockSettings}
			/>,
		);

		const timeSlots = screen.getAllByText(/^\d{2}:\d{2}$/);
		expect(timeSlots.length).toBeGreaterThan(0);
	});

	it("displays all day events when present", () => {
		const allDayEvents: ScheduleEvent[] = [
			{
				id: "1",
				resourceId: "resource-1",
				groupId: "group-1",
				title: "All Day Event",
				attendee: "Jane Smith",
				startDate: new Date("2025-01-15T00:00:00Z"),
				endDate: new Date("2025-01-16T00:00:00Z"),
				status: "confirmed",
				isAllDay: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		];

		render(
			<WeekView
				currentDate={new Date("2025-01-15")}
				events={allDayEvents}
				settings={mockSettings}
			/>,
		);

		expect(screen.getByText("終日")).toBeInTheDocument();
		expect(screen.getByText("All Day Event")).toBeInTheDocument();
	});

	it("does not display all day events row when no all day events", () => {
		const timedEvents: ScheduleEvent[] = [
			{
				id: "1",
				resourceId: "resource-1",
				groupId: "group-1",
				title: "Timed Event",
				attendee: "John Doe",
				startDate: new Date("2025-01-15T10:00:00Z"),
				endDate: new Date("2025-01-15T11:00:00Z"),
				status: "confirmed",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		];

		render(
			<WeekView
				currentDate={new Date("2025-01-15")}
				events={timedEvents}
				settings={mockSettings}
			/>,
		);

		expect(screen.queryByText("終日")).not.toBeInTheDocument();
	});

	it("highlights today", () => {
		const today = new Date();
		render(
			<WeekView
				currentDate={today}
				events={mockEvents}
				settings={mockSettings}
			/>,
		);

		expect(screen.getByText(today.getDate())).toBeInTheDocument();
	});

	it("highlights selected date", () => {
		render(
			<WeekView
				currentDate={new Date("2025-01-15")}
				events={mockEvents}
				settings={mockSettings}
			/>,
		);

		expect(screen.getByText("15")).toBeInTheDocument();
	});

	it("calls onEventClick when clicking on an event", () => {
		render(
			<WeekView
				currentDate={new Date("2025-01-15")}
				events={mockEvents}
				settings={mockSettings}
				onEventClick={mockOnEventClick}
			/>,
		);

		fireEvent.click(screen.getByText("Test Event"));
		expect(mockOnEventClick).toHaveBeenCalled();
	});

	it("displays timed events", () => {
		render(
			<WeekView
				currentDate={new Date("2025-01-15")}
				events={mockEvents}
				settings={mockSettings}
			/>,
		);

		expect(screen.getByText("Test Event")).toBeInTheDocument();
	});

	it("generates correct number of days", () => {
		render(
			<WeekView
				currentDate={new Date("2025-01-15")}
				events={mockEvents}
				settings={mockSettings}
			/>,
		);

		const allDates = screen.getAllByText(/^\d+$/);
		expect(allDates.length).toBeGreaterThan(0);
	});
});
