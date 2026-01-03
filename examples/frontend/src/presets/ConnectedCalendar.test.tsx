import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConnectedCalendar } from "./ConnectedCalendar";
import { vi, describe, it, expect } from 'vitest';

const mockContext = vi.fn();

vi.mock("./ScheduleContext", () => ({
	useScheduleContext: () => mockContext(),
}));

// Mock ScheduleManager from regular-calendar
vi.mock("regular-calendar", async (importOriginal) => {
	const actual = await importOriginal<typeof import("regular-calendar")>();
	return {
		...actual,
		ScheduleManager: ({
			onEventCreate,
			onEventUpdate,
			onEventDelete,
		}: {
			onEventCreate: (data: any) => Promise<void>;
			onEventUpdate: (id: string, data: any) => Promise<void>;
			onEventDelete: (id: string) => Promise<void>;
		}) => (
			<div>
				<button
					onClick={() => {
						// Simulate create
						onEventCreate({ title: "New Event", start: "2024-01-01" });
					}}
				>
					Simulate Create
				</button>
				<button
					onClick={() => {
						// Simulate update
						onEventUpdate("e1", { title: "Updated Event" });
					}}
				>
					Simulate Update
				</button>
				<button
					onClick={() => {
						// Simulate delete
						onEventDelete("e1");
					}}
				>
					Simulate Delete
				</button>
			</div>
		),
	};
});

describe("ConnectedCalendar", () => {
	it("renders loading and error states", () => {
		mockContext.mockReturnValue({
			events: [],
			resources: [],
			groups: [],
			settings: null,
			loading: true,
			error: null,
		});

		render(
			<ConnectedCalendar
				settings={{
					weekStartsOn: 1,
					businessHoursStart: "08:00",
					businessHoursEnd: "18:00",
					timeZone: "UTC",
				}}
			/>,
		);

		expect(screen.getByText("Loading schedule data...")).toBeInTheDocument();

		mockContext.mockReturnValue({
			events: [],
			resources: [],
			groups: [],
			settings: null,
			loading: false,
			error: "Boom",
		});

		render(
			<ConnectedCalendar
				settings={{
					weekStartsOn: 1,
					businessHoursStart: "08:00",
					businessHoursEnd: "18:00",
					timeZone: "UTC",
				}}
			/>,
		);

		expect(screen.getByText("Error: Boom")).toBeInTheDocument();
	});

	it("calls create/update/delete callbacks", async () => {
		const user = userEvent.setup();
		const createEvent = vi.fn().mockResolvedValue(undefined);
		const updateEvent = vi.fn().mockResolvedValue(undefined);
		const deleteEvent = vi.fn().mockResolvedValue(undefined);

		mockContext.mockReturnValue({
			events: [{ id: "e1", title: "Existing" }],
			resources: [],
			groups: [],
			settings: { weekStartsOn: 1 },
			loading: false,
			error: null,
			createEvent,
			updateEvent,
			deleteEvent,
		});

		render(
			<ConnectedCalendar
				settings={{
					weekStartsOn: 1,
					businessHoursStart: "08:00",
					businessHoursEnd: "18:00",
					timeZone: "UTC",
				}}
			/>,
		);

		// Click simulate buttons
		await user.click(screen.getByText("Simulate Create"));
		expect(createEvent).toHaveBeenCalled();

		await user.click(screen.getByText("Simulate Update"));
		expect(updateEvent).toHaveBeenCalledWith("e1", expect.objectContaining({ title: "Updated Event" }));

		await user.click(screen.getByText("Simulate Delete"));
		expect(deleteEvent).toHaveBeenCalledWith("e1");
	});
});
