import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConnectedCalendar } from "./ConnectedCalendar";

const mockContext = vi.fn();

vi.mock("./ScheduleContext", () => ({
	useScheduleContext: () => mockContext(),
}));

vi.mock("regular-calendar", async (importOriginal) => {
	// eslint-disable-next-line @typescript-eslint/consistent-type-imports
	const actual = await importOriginal<typeof import("regular-calendar")>();
	return {
		...actual,
		RegularCalendar: ({
			onEventClick,
			onTimeSlotClick,
		}: {
			onEventClick?: (event: { id: string; title: string }) => void;
			onTimeSlotClick?: (date: Date) => void;
		}) => (
			<div>
				<button
					type="button"
					onClick={() => onEventClick?.({ id: "e1", title: "Event" } as any)}
				>
					Event
				</button>
				<button
					type="button"
					onClick={() => onTimeSlotClick?.(new Date("2024-01-10T10:00:00Z"))}
				>
					Open Slot
				</button>
			</div>
		),
	};
});

vi.mock("./ConnectedEventModal", () => ({
	ConnectedEventModal: ({
		isOpen,
		onSave,
		onDelete,
	}: {
		isOpen: boolean;
		onSave: (data: { title: string }) => void;
		onDelete?: () => void;
	}) => (
		<div>
			<div>Modal {isOpen ? "open" : "closed"}</div>
			<button type="button" onClick={() => onSave({ title: "New" })}>
				Save
			</button>
			<button type="button" onClick={() => onDelete?.()}>
				Delete
			</button>
		</div>
	),
}));

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

	it("opens modal and calls create/update/delete", async () => {
		const user = userEvent.setup();
		const createEvent = vi.fn().mockResolvedValue(undefined);
		const updateEvent = vi.fn().mockResolvedValue(undefined);
		const deleteEvent = vi.fn().mockResolvedValue(undefined);

		mockContext.mockReturnValue({
			events: [],
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

		await user.click(screen.getByRole("button", { name: "Event" }));
		expect(screen.getByText("Modal open")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Delete" }));
		expect(deleteEvent).toHaveBeenCalled();

		await user.click(screen.getByRole("button", { name: "Event" }));
		await user.click(screen.getByRole("button", { name: "Save" }));
		expect(updateEvent).toHaveBeenCalled();

		await user.click(screen.getByRole("button", { name: "Open Slot" }));
		await user.click(screen.getByRole("button", { name: "Save" }));
		expect(createEvent).toHaveBeenCalled();
	});
});
