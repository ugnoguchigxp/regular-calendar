import { fireEvent, render, screen } from "@testing-library/react";
import { ResourceColumn } from "./ResourceColumn";

const resource = {
	id: "r1",
	name: "Room 1",
	order: 1,
	isAvailable: true,
	groupId: "g1",
	createdAt: new Date(),
	updatedAt: new Date(),
};

const baseEvent = {
	id: "e1",
	resourceId: "r1",
	groupId: "g1",
	title: "Checkup",
	attendee: "Patient A",
	startDate: new Date("2024-01-10T08:00:00Z"),
	endDate: new Date("2024-01-10T09:00:00Z"),
	status: "booked",
	createdAt: new Date(),
	updatedAt: new Date(),
};

describe("ResourceColumn", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2024-01-10T00:00:00Z"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("renders events and handles clicks", () => {
		const onEventClick = vi.fn();
		const onEmptySlotClick = vi.fn();
		const { container } = render(
			<ResourceColumn
				resource={resource}
				events={[baseEvent]}
				allDayEvents={[]}
				startTime="08:00"
				endTime="10:00"
				currentDate={new Date("2024-01-10T00:00:00Z")}
				slotHeight={60}
				onEventClick={onEventClick}
				onEmptySlotClick={onEmptySlotClick}
			/>,
		);

		expect(screen.getByText("Room 1")).toBeInTheDocument();
		const eventButtons = screen.getAllByText("Checkup");
		fireEvent.click(eventButtons[0]);
		expect(onEventClick).toHaveBeenCalled();

		const content = container.querySelector("div.relative.flex-1");
		if (!content) throw new Error("Content area not found");

		vi.spyOn(content, "getBoundingClientRect").mockReturnValue({
			x: 0,
			y: 0,
			width: 300,
			height: 300,
			top: 0,
			left: 0,
			bottom: 300,
			right: 300,
			toJSON: () => {},
		});

		fireEvent.pointerUp(content, { clientY: 30 });
		expect(onEmptySlotClick).toHaveBeenCalled();
		const [resourceIdArg, clickedDate] = onEmptySlotClick.mock.calls[0];
		expect(resourceIdArg).toBe("r1");
		expect(clickedDate).toBeInstanceOf(Date);
	});

	it("includes all-day events in layout", () => {
		render(
			<ResourceColumn
				resource={resource}
				events={[]}
				allDayEvents={[{ ...baseEvent, id: "e2", isAllDay: true }]}
				startTime="08:00"
				endTime="10:00"
				currentDate={new Date("2024-01-10T00:00:00Z")}
				slotHeight={60}
			/>,
		);

		expect(screen.getAllByText("Checkup").length).toBeGreaterThan(0);
	});

	it("ignores empty slot clicks when handler is missing", () => {
		const { container } = render(
			<ResourceColumn
				resource={resource}
				events={[baseEvent]}
				startTime="08:00"
				endTime="10:00"
				currentDate={new Date("2024-01-10T00:00:00Z")}
				slotHeight={60}
			/>,
		);

		const content = container.querySelector("div.relative.flex-1");
		if (!content) throw new Error("Content area not found");

		expect(() => fireEvent.pointerUp(content, { clientY: 30 })).not.toThrow();
	});

	it("renders overlapping events in separate columns", () => {
		const overlapEvents = [
			baseEvent,
			{
				...baseEvent,
				id: "e2",
				title: "Overlap",
				startDate: new Date("2024-01-10T08:30:00Z"),
				endDate: new Date("2024-01-10T09:30:00Z"),
			},
		];

		render(
			<ResourceColumn
				resource={resource}
				events={overlapEvents}
				startTime="08:00"
				endTime="10:00"
				currentDate={new Date("2024-01-10T00:00:00Z")}
				slotHeight={60}
			/>,
		);

		const buttons = screen.getAllByRole("button", { name: /Checkup|Overlap/ });
		expect(buttons).toHaveLength(2);
		expect(buttons[0].style.width).toBe("50%");
		expect(buttons[1].style.width).toBe("50%");
	});

	it("triggers header action button to add event", () => {
		const onEmptySlotClick = vi.fn();
		render(
			<ResourceColumn
				resource={resource}
				events={[]}
				startTime="08:00"
				endTime="10:00"
				currentDate={new Date("2024-01-10T00:00:00Z")}
				slotHeight={60}
				onEmptySlotClick={onEmptySlotClick}
			/>,
		);

		fireEvent.click(
			screen.getByRole("button", { name: "Add event to Room 1" }),
		);
		expect(onEmptySlotClick).toHaveBeenCalledTimes(1);
		const [resourceId, clickDate] = onEmptySlotClick.mock.calls[0];
		expect(resourceId).toBe("r1");
		expect(clickDate.getHours()).toBe(8);
		expect(clickDate.getMinutes()).toBe(0);
	});
});
