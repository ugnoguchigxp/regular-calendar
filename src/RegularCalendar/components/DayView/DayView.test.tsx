import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type {
	FacilityScheduleSettings,
	ScheduleEvent,
} from "../../RegularCalendar.schema";
import { DayView } from "./DayView";

type EventItemProps = {
	event: ScheduleEvent;
	onEventClick?: (event: ScheduleEvent) => void;
};

vi.mock("../Common/EventComponents", () => ({
	EventItem: ({ event, onEventClick }: EventItemProps) => (
		<button
			type="button"
			data-testid={`event-item-${event.id}`}
			onClick={() => onEventClick?.(event)}
		>
			{event.title}
		</button>
	),
}));

const baseEvent: ScheduleEvent = {
	id: "event-1",
	resourceId: "resource-1",
	groupId: "group-1",
	title: "Checkup",
	attendee: "[]",
	startDate: new Date("2025-01-15T09:00:00"),
	endDate: new Date("2025-01-15T10:00:00"),
	status: "confirmed",
	createdAt: new Date("2025-01-01T00:00:00"),
	updatedAt: new Date("2025-01-01T00:00:00"),
};

const settings: FacilityScheduleSettings = {
	startTime: "09:00",
	endTime: "10:00",
	defaultDuration: 30,
	closedDays: [],
	weekStartsOn: 1,
	timeZone: "Asia/Tokyo",
};

describe("DayView", () => {
	beforeAll(() => {
		if (!global.ResizeObserver) {
			global.ResizeObserver = class ResizeObserverMock {
				observe() {}
				disconnect() {}
				unobserve() {}
			};
		}
	});

	it("renders all-day events and handles event clicks", () => {
		const onEventClick = vi.fn();
		const allDayEvent: ScheduleEvent = {
			...baseEvent,
			id: "event-2",
			title: "All Day",
			isAllDay: true,
		};

		render(
			<DayView
				currentDate={new Date("2025-01-15T00:00:00")}
				events={[allDayEvent, baseEvent]}
				settings={settings}
				onEventClick={onEventClick}
			/>,
		);

		expect(screen.getByText("All day")).toBeInTheDocument();
		fireEvent.click(screen.getByText("All Day"));
		expect(onEventClick).toHaveBeenCalledWith(allDayEvent);

		fireEvent.click(screen.getByTestId("event-item-event-1"));
		expect(onEventClick).toHaveBeenCalledWith(baseEvent);
	});

	it("renders without all-day row and handles time slot clicks", () => {
		const onTimeSlotClick = vi.fn();
		const currentDate = new Date("2025-01-16T00:00:00");
		const { container } = render(
			<DayView
				currentDate={currentDate}
				events={[baseEvent]}
				settings={settings}
				onTimeSlotClick={onTimeSlotClick}
			/>,
		);

		expect(screen.queryByText("All day")).not.toBeInTheDocument();

		const slots = container.querySelectorAll(
			"button.border-b.border-border.cursor-pointer",
		);
		expect(slots.length).toBeGreaterThan(0);
		fireEvent.click(slots[0]);

		expect(onTimeSlotClick).toHaveBeenCalledWith(currentDate, "09:00");
	});

	it("highlights today styling when currentDate is today", () => {
		const today = new Date();
		render(<DayView currentDate={today} events={[]} settings={settings} />);

		expect(screen.getByText(String(today.getDate()))).toHaveClass(
			"text-primary",
		);
	});

	it("does not highlight date styling when not today", () => {
		const notToday = new Date("2025-02-01T00:00:00");
		render(<DayView currentDate={notToday} events={[]} settings={settings} />);

		expect(screen.getByText(String(notToday.getDate()))).not.toHaveClass(
			"text-primary",
		);
	});

	it("renders vertical orientation and handles time slot clicks", () => {
		const onTimeSlotClick = vi.fn();
		const currentDate = new Date("2025-01-15T00:00:00");
		render(
			<DayView
				currentDate={currentDate}
				events={[baseEvent]}
				settings={{ ...settings, orientation: "vertical" }}
				onTimeSlotClick={onTimeSlotClick}
			/>,
		);

		fireEvent.click(screen.getByLabelText("Time slot 09:00"));
		expect(onTimeSlotClick).toHaveBeenCalledWith(currentDate, "09:00");
	});

	it("uses custom EventCard for all-day events", () => {
		const onEventClick = vi.fn();
		const allDayEvent: ScheduleEvent = {
			...baseEvent,
			id: "event-3",
			title: "Custom All Day",
			isAllDay: true,
		};

		render(
			<DayView
				currentDate={new Date("2025-01-15T00:00:00")}
				events={[allDayEvent]}
				settings={settings}
				onEventClick={onEventClick}
				components={{
					EventCard: ({ event, onClick }) => (
						<span role="button" tabIndex={0} onClick={onClick}>
							Custom: {event.title}
						</span>
					),
				}}
			/>,
		);

		fireEvent.click(screen.getByText("Custom: Custom All Day"));
		expect(onEventClick).toHaveBeenCalledWith(allDayEvent);
	});
});
