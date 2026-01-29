import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type {
	Personnel,
	Resource,
	ResourceGroup,
	ScheduleEvent,
} from "../../../FacilitySchedule/FacilitySchedule.schema";
import { DefaultEventModal } from "./DefaultEventModal";

const resources: Resource[] = [
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

const groups: ResourceGroup[] = [
	{
		id: "g1",
		name: "Group A",
		displayMode: "grid",
		dimension: 1,
		resources,
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

const personnel: Personnel[] = [
	{ id: "p1", name: "Alice", priority: 1 },
	{ id: "p2", name: "Bob", priority: 2 },
];

describe("DefaultEventModal", () => {
	it("creates an event, shows conflicts, and passes prepared data", async () => {
		const user = userEvent.setup();
		const onSave = vi.fn();
		const onClose = vi.fn();
		const defaultStartTime = new Date("2026-01-02T09:00:00");

		render(
			<DefaultEventModal
				isOpen={true}
				resources={resources}
				groups={groups}
				events={[
					{
						id: "e-conflict",
						title: "Conflict",
						resourceId: "r1",
						groupId: "g1",
						startDate: new Date("2026-01-02T09:30:00"),
						endDate: new Date("2026-01-02T10:30:00"),
						status: "booked",
						attendee: "[]",
						createdAt: new Date(),
						updatedAt: new Date(),
					} as ScheduleEvent,
				]}
				defaultStartTime={defaultStartTime}
				defaultResourceId="r1"
				onClose={onClose}
				onSave={onSave}
				currentUserId="9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
				personnel={personnel}
				customFields={[
					{
						name: "notes",
						label: "Notes",
						type: "textarea",
						placeholder: "Type notes",
					},
					{
						name: "priority",
						label: "Priority",
						type: "number",
					},
					{
						name: "category",
						label: "Category",
						type: "select",
						options: [
							{ label: "A", value: "a" },
							{ label: "B", value: "b" },
						],
					},
				]}
			/>,
		);

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 150));
		});

		expect(screen.getByText("Conflict Detected")).toBeInTheDocument();

		const titleInput = screen.getByPlaceholderText("event_name_placeholder");
		await user.type(titleInput, "Demo Event");

		const saveButton = screen.getByRole("button", { name: /save_button/i });
		await user.click(saveButton);

		expect(onSave).toHaveBeenCalledTimes(1);
		const payload = onSave.mock.calls[0]?.[0];
		expect(payload.title).toBe("Demo Event");
		expect(payload.startDate).toBeInstanceOf(Date);
		expect(payload.endDate.getTime()).toBeGreaterThan(payload.startDate.getTime());
		expect(payload.attendee).toContain("John Doe");
	});

	it("supports delete confirmation in edit mode", async () => {
		const user = userEvent.setup();
		const onSave = vi.fn();
		const onClose = vi.fn();
		const onDelete = vi.fn();
		const event: ScheduleEvent = {
			id: "e1",
			title: "Existing",
			resourceId: "r1",
			groupId: "g1",
			startDate: new Date("2026-01-02T09:00:00"),
			endDate: new Date("2026-01-02T10:00:00"),
			status: "booked",
			attendee: "[]",
			createdAt: new Date(),
			updatedAt: new Date(),
			extendedProps: { ownerId: "p1" },
		};

		render(
			<DefaultEventModal
				isOpen={true}
				event={event}
				resources={resources}
				groups={groups}
				events={[event]}
				onClose={onClose}
				onSave={onSave}
				onDelete={onDelete}
				currentUserId="p1"
				readOnlyResource={true}
			/>,
		);

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 150));
		});

		const deleteButton = screen.getByRole("button", { name: /delete_button/i });
		await user.click(deleteButton);

		const confirmButton = screen.getByRole("button", { name: /Confirm/i });
		await user.click(confirmButton);

		expect(onDelete).toHaveBeenCalledWith("e1");
		expect(onClose).toHaveBeenCalled();
	});

	it("renders read-only view when user is not owner", async () => {
		const event: ScheduleEvent = {
			id: "e-readonly",
			title: "Read Only",
			resourceId: "r1",
			groupId: "g1",
			startDate: new Date("2026-01-02T09:00:00"),
			endDate: new Date("2026-01-02T10:00:00"),
			status: "booked",
			attendee: "[]",
			createdAt: new Date(),
			updatedAt: new Date(),
			extendedProps: { ownerId: "p1" },
		};

		render(
			<DefaultEventModal
				isOpen={true}
				event={event}
				resources={resources}
				groups={groups}
				events={[event]}
				onClose={vi.fn()}
				onSave={vi.fn()}
				currentUserId="p2"
			/>,
		);

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 150));
		});

		expect(
			screen.getByText(
				"You cannot edit this event because you are not the owner.",
			),
		).toBeInTheDocument();
		expect(screen.getAllByText("View Event (Read Only)").length).toBeGreaterThan(
			0,
		);
	});

	it("falls back to resource name when group is missing", async () => {
		const event: ScheduleEvent = {
			id: "e-no-group",
			title: "No Group",
			resourceId: "r1",
			groupId: "g-missing",
			startDate: new Date("2026-01-02T09:00:00"),
			endDate: new Date("2026-01-02T10:00:00"),
			status: "booked",
			attendee: "[]",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		render(
			<DefaultEventModal
				isOpen={true}
				event={event}
				resources={resources}
				groups={[]}
				events={[event]}
				onClose={vi.fn()}
				onSave={vi.fn()}
				readOnlyResource={true}
			/>,
		);

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 150));
		});

		expect(screen.getByText("Room 1")).toBeInTheDocument();
	});

	it("shows raw resource id when resource is missing", async () => {
		const event: ScheduleEvent = {
			id: "e-missing-resource",
			title: "Missing Resource",
			resourceId: "r-missing",
			groupId: "g1",
			startDate: new Date("2026-01-02T09:00:00"),
			endDate: new Date("2026-01-02T10:00:00"),
			status: "booked",
			attendee: "[]",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		render(
			<DefaultEventModal
				isOpen={true}
				event={event}
				resources={[]}
				groups={[]}
				events={[event]}
				onClose={vi.fn()}
				onSave={vi.fn()}
				readOnlyResource={true}
			/>,
		);

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 150));
		});

		expect(screen.getByText("r-missing")).toBeInTheDocument();
	});

	it("renders safely when closed with no resources", () => {
		render(
			<DefaultEventModal
				isOpen={false}
				resources={[]}
				groups={[]}
				events={[]}
				onClose={vi.fn()}
				onSave={vi.fn()}
			/>,
		);
	});
});
