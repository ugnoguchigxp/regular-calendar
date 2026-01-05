import { render, screen } from "@testing-library/react";
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
	KeypadModal: () => null,
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
});
