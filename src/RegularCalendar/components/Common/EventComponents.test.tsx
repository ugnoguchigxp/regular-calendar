import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ScheduleEvent } from "../../RegularCalendar.schema";

const mockUseDraggable = vi.hoisted(() =>
	vi.fn(() => ({
		attributes: {},
		listeners: {},
		setNodeRef: vi.fn(),
		isDragging: false,
	})),
);

vi.mock("@dnd-kit/core", () => ({
	useDraggable: (..._args: unknown[]) => mockUseDraggable(),
}));

import { EventDragOverlay, EventItem, MonthEventItem } from "./EventComponents";

const baseEvent: ScheduleEvent = {
	id: "event-1",
	resourceId: "resource-1",
	groupId: "group-1",
	title: "Consult",
	attendee: "[]",
	startDate: new Date("2025-01-15T09:05:00"),
	endDate: new Date("2025-01-15T10:05:00"),
	status: "confirmed",
	description: "Exam room",
	createdAt: new Date("2025-01-01T00:00:00"),
	updatedAt: new Date("2025-01-01T00:00:00"),
};

describe("EventComponents", () => {
	it("renders EventItem and handles click/keyboard events", () => {
		const onEventClick = vi.fn();
		render(
			<EventItem
				event={{
					...baseEvent,
					attendee: JSON.stringify([{ name: "Alice" }, { name: "Bob" }]),
				}}
				position={{ top: 0, height: 40 }}
				onEventClick={onEventClick}
			/>,
		);

		expect(screen.getByText("Alice, Bob")).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button"));
		expect(onEventClick).toHaveBeenCalledTimes(1);

		fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
		expect(onEventClick).toHaveBeenCalledTimes(2);
	});

	it("shows location when height allows and uses location object", () => {
		const eventWithLocation = {
			...baseEvent,
			extendedProps: {
				location: { building: "Main", room: "101" },
			},
		};

		render(
			<EventItem event={eventWithLocation} position={{ top: 0, height: 80 }} />,
		);

		expect(screen.getByText("Main 101")).toBeInTheDocument();
	});

	it("omits location when height is small", () => {
		const eventWithLocation = {
			...baseEvent,
			extendedProps: {
				location: "Second Floor",
			},
		};

		render(
			<EventItem event={eventWithLocation} position={{ top: 0, height: 50 }} />,
		);

		expect(screen.queryByText("Second Floor")).not.toBeInTheDocument();
	});

	it("handles self-only attendee and dragging state", () => {
		mockUseDraggable.mockReturnValueOnce({
			attributes: {},
			listeners: {},
			setNodeRef: vi.fn(),
			isDragging: true,
		});

		render(
			<EventItem
				event={{ ...baseEvent, attendee: "" }}
				position={{ top: 0, height: 80 }}
			/>,
		);

		expect(screen.queryByText("Only me")).not.toBeInTheDocument();
	});

	it("renders month event time label for timed and all-day events", () => {
		const onClick = vi.fn();
		const timed = render(
			<MonthEventItem event={baseEvent} onClick={onClick} />,
		);

		expect(screen.getByText("9:05")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button"));
		expect(onClick).toHaveBeenCalledWith(baseEvent);
		timed.unmount();

		render(
			<MonthEventItem
				event={{
					...baseEvent,
					extendedProps: { isAllDay: true },
				}}
			/>,
		);

		expect(screen.getByText("All Day")).toBeInTheDocument();
	});

	it("renders drag overlay with attendee and location formatting", () => {
		render(
			<EventDragOverlay
				event={{
					...baseEvent,
					attendee: JSON.stringify([{ name: "Kai" }]),
					extendedProps: { location: "Room A" },
				}}
			/>,
		);

		expect(screen.getByText("with Kai")).toBeInTheDocument();
		expect(screen.getByText("Room A")).toBeInTheDocument();
	});

	it("renders drag overlay for self-only attendee", () => {
		render(
			<EventDragOverlay
				event={{
					...baseEvent,
					attendee: "[]",
				}}
			/>,
		);

		expect(screen.queryByText("Only me")).not.toBeInTheDocument();
		expect(screen.queryByText(/with /i)).not.toBeInTheDocument();
	});
});
