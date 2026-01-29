import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventForm } from "./EventForm";

const mockUseResourceAvailability = vi.fn();
const mockUseScheduleConflict = vi.fn();
const mockUseAttendeeManagement = vi.fn();

vi.mock("../../FacilitySchedule/hooks/useResourceAvailability", () => ({
	useResourceAvailability: (args: unknown) => mockUseResourceAvailability(args),
}));

vi.mock("../../FacilitySchedule/hooks/useScheduleConflict", () => ({
	useScheduleConflict: (args: unknown) => mockUseScheduleConflict(args),
}));

vi.mock("../../FacilitySchedule/hooks/useAttendeeManagement", () => ({
	useAttendeeManagement: (args: unknown) => mockUseAttendeeManagement(args),
}));

vi.mock("@/components/ui/KeypadModal", () => ({
	KeypadModal: ({
		open,
		onSubmit,
	}: {
		open: boolean;
		onSubmit: (time: string) => void;
	}) =>
		open ? (
			<button type="button" onClick={() => onSubmit("10:30")}>
				SetTime
			</button>
		) : null,
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

describe("EventForm", () => {
	beforeEach(() => {
		mockUseResourceAvailability.mockReturnValue({
			availableResources: resources,
			resourceNames: ["Room 1"],
			getDisplayName: (id: string) => (id === "r1" ? "Room 1" : ""),
		});

		mockUseScheduleConflict.mockReturnValue({
			resourceId: "r1",
			existingSchedule: events[0],
			newSchedule: {},
			conflictType: "overlap",
		});

		mockUseAttendeeManagement.mockReturnValue({
			parseAttendees: () => [],
			processAttendeesForSubmit: () => ({
				finalAttendees: [{ name: "Guest", type: "external" }],
				shouldDelete: false,
			}),
		});
	});

	it("submits valid form data and shows conflict warning", async () => {
		const user = userEvent.setup();

		const onSubmit = vi.fn();

		render(
			<EventForm
				resources={resources}
				groups={groups}
				events={events}
				defaultResourceId="r1"
				onSubmit={onSubmit}
				onCancel={vi.fn()}
			/>,
		);

		await user.type(
			screen.getByPlaceholderText("Enter event name"),
			"John Doe",
		);

		await user.click(screen.getByRole("button", { name: /save/i }));
		expect(onSubmit).toHaveBeenCalled();
		expect(screen.getByText("Conflict Detected")).toBeInTheDocument();
	});

	it("renders read-only resource and calls delete in edit mode", async () => {
		const user = userEvent.setup();
		const onDelete = vi.fn();

		render(
			<EventForm
				event={events[0]}
				resources={resources}
				groups={groups}
				events={events}
				readOnlyResource
				onSubmit={vi.fn()}
				onCancel={vi.fn()}
				onDelete={onDelete}
			/>,
		);

		expect(screen.getByText("Room 1")).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: /delete/i }));
		expect(onDelete).toHaveBeenCalled();
	});

	it("calls onDelete when attendee management requests deletion", async () => {
		const user = userEvent.setup();
		const onDelete = vi.fn();
		const onSubmit = vi.fn();

		mockUseAttendeeManagement.mockReturnValue({
			parseAttendees: () => [],
			processAttendeesForSubmit: () => ({
				finalAttendees: "[]",
				shouldDelete: true,
			}),
		});

		render(
			<EventForm
				event={events[0]}
				resources={resources}
				groups={groups}
				events={events}
				onSubmit={onSubmit}
				onCancel={vi.fn()}
				onDelete={onDelete}
			/>,
		);

		await user.type(
			screen.getByPlaceholderText("Enter event name"),
			"Delete Me",
		);
		await user.click(screen.getByRole("button", { name: /save/i }));
		expect(onDelete).toHaveBeenCalled();
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("emits availability requests and includes custom fields", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		const onAvailabilityRequest = vi.fn();

		const { container } = render(
			<EventForm
				resources={resources}
				groups={groups}
				events={events}
				onSubmit={onSubmit}
				onCancel={vi.fn()}
				onAvailabilityRequest={onAvailabilityRequest}
				customFields={[
					{ name: "priority", label: "Priority", type: "number", required: true },
					{ name: "notes", label: "Notes", type: "text" },
					{
						name: "flag",
						label: "Flag",
						type: "boolean",
						defaultValue: false,
					},
					{
						name: "category",
						label: "Category",
						type: "select",
						defaultValue: "a",
						options: [
							{ value: "a", label: "A" },
							{ value: "b", label: "B" },
						],
					},
				]}
			/>,
		);

		await user.type(
			screen.getByPlaceholderText("Enter event name"),
			"Custom Event",
		);
		const priorityInput = container.querySelector(
			'input[name="priority"]',
		) as HTMLInputElement | null;
		const notesInput = container.querySelector(
			'input[name="notes"]',
		) as HTMLInputElement | null;
		expect(priorityInput).toBeTruthy();
		expect(notesInput).toBeTruthy();
		await user.type(priorityInput as HTMLInputElement, "2");
		await user.type(notesInput as HTMLInputElement, "Hello");
		await user.click(screen.getByRole("button", { name: /save/i }));

		await waitFor(() => {
			expect(onAvailabilityRequest).toHaveBeenCalled();
		});
		expect(onSubmit).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Custom Event",
				extendedProps: expect.objectContaining({
					priority: 2,
					notes: "Hello",
				}),
			}),
		);
	});

	it("submits all-day events with midnight start", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();

		render(
			<EventForm
				resources={resources}
				groups={groups}
				events={events}
				onSubmit={onSubmit}
				onCancel={vi.fn()}
			/>,
		);

		await user.type(
			screen.getByPlaceholderText("Enter event name"),
			"All Day Event",
		);
		await user.click(screen.getByRole("checkbox"));
		await user.click(screen.getByRole("button", { name: /save/i }));

		const payload = onSubmit.mock.calls[0]?.[0];
		expect(payload.startDate.getHours()).toBe(0);
		expect(payload.startDate.getMinutes()).toBe(0);
	});

	it("updates time via keypad modal", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();

		const { container } = render(
			<EventForm
				resources={resources}
				groups={groups}
				events={events}
				defaultStartTime={new Date("2026-01-02T09:00:00")}
				onSubmit={onSubmit}
				onCancel={vi.fn()}
			/>,
		);

		const timeInput = container.querySelector(
			"input[readonly]",
		) as HTMLInputElement | null;
		expect(timeInput).toBeTruthy();

		await user.click(timeInput as HTMLInputElement);
		await user.click(screen.getByRole("button", { name: "SetTime" }));
		await user.type(
			screen.getByPlaceholderText("Enter event name"),
			"Time Updated",
		);
		await user.click(screen.getByRole("button", { name: /save/i }));

		const payload = onSubmit.mock.calls[0]?.[0];
		expect(payload.startDate.getHours()).toBe(10);
		expect(payload.startDate.getMinutes()).toBe(30);
	});
});
