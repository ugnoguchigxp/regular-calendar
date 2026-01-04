import { act, fireEvent, render, screen } from "@testing-library/react";
import type {
	EventFormData,
	ScheduleEvent,
} from "../../FacilitySchedule/FacilitySchedule.schema";
import { EventModal } from "./EventModal";

type EventFormProps = {
	onSubmit: (data: EventFormData) => void;
	onCancel: () => void;
	onDelete?: () => void;
	event?: ScheduleEvent;
};

vi.mock("./EventForm", () => ({
	EventForm: ({ onSubmit, onCancel, onDelete, event }: EventFormProps) => (
		<div>
			<div>{event ? "edit" : "create"}</div>
			<button
				type="button"
				onClick={() =>
					onSubmit({
						title: "Test",
						attendee: "[]",
						startDate: new Date(),
						endDate: new Date(),
						durationHours: 1,
					})
				}
			>
				Submit
			</button>
			<button type="button" onClick={onCancel}>
				Cancel
			</button>
			<button type="button" onClick={() => onDelete?.()}>
				Delete
			</button>
		</div>
	),
}));

const resources = [
	{
		id: "r1",
		name: "Room 1",
		order: 1,
		isAvailable: true,
		groupId: "g1",
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

const groups = [
	{
		id: "g1",
		name: "Group A",
		displayMode: "grid" as const,
		dimension: 1,
		resources,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

const events = [
	{
		id: "e1",
		resourceId: "r1",
		groupId: "g1",
		title: "Existing",
		attendee: "[]",
		startDate: new Date("2024-01-10T08:00:00Z"),
		endDate: new Date("2024-01-10T09:00:00Z"),
		status: "booked",
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

describe("EventModal", () => {
	it("calls onSave and handles delete confirmation", async () => {
		vi.useFakeTimers();
		const onSave = vi.fn();
		const onClose = vi.fn();
		const onDelete = vi.fn();

		render(
			<EventModal
				isOpen
				event={events[0]}
				resources={resources}
				groups={groups}
				events={events}
				onClose={onClose}
				onSave={onSave}
				onDelete={onDelete}
			/>,
		);

		act(() => {
			vi.runAllTimers();
		});

		fireEvent.click(screen.getByRole("button", { name: "Submit" }));
		expect(onSave).toHaveBeenCalled();

		fireEvent.click(screen.getByRole("button", { name: "Delete" }));
		fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
		expect(onDelete).toHaveBeenCalledWith("e1");
		expect(onClose).toHaveBeenCalled();

		vi.useRealTimers();
	});
});
