import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ScheduleEvent } from "../../FacilitySchedule/FacilitySchedule.schema";
import { ScheduleManager } from "./ScheduleManager";

const calendarPropsSpy = vi.fn();
const modalPropsSpy = vi.fn();

vi.mock("../../RegularCalendar/RegularCalendar", () => ({
	RegularCalendar: (props: any) => {
		calendarPropsSpy(props);
		return (
			<div data-testid="calendar">
				<button
					type="button"
					onClick={() => props.onTimeSlotClick(new Date("2026-01-02T09:00:00"))}
				>
					open-create
				</button>
				<button
					type="button"
					onClick={() =>
						props.onEventClick({
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
						} as ScheduleEvent)
					}
				>
					open-edit
				</button>
			</div>
		);
	},
}));

vi.mock("./DefaultEventModal/DefaultEventModal", () => ({
	DefaultEventModal: (props: any) => {
		modalPropsSpy(props);
		return <div data-testid="default-event-modal" />;
	},
}));

describe("ScheduleManager", () => {
	it("creates, updates, and deletes events with toasts", async () => {
		const user = userEvent.setup();
		const onEventCreate = vi.fn().mockResolvedValue(undefined);
		const onEventUpdate = vi.fn().mockResolvedValue(undefined);
		const onEventDelete = vi.fn().mockResolvedValue(undefined);
		const onToast = vi.fn();

		render(
			<ScheduleManager
				events={[]}
				resources={[]}
				groups={[]}
				settings={{
					defaultDuration: 1,
					startTime: "08:00",
					endTime: "18:00",
					closedDays: [],
					weekStartsOn: 0,
				}}
				isLoading={false}
				onEventCreate={onEventCreate}
				onEventUpdate={onEventUpdate}
				onEventDelete={onEventDelete}
				onToast={onToast}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "open-create" }));
		const createProps = modalPropsSpy.mock.calls.at(-1)?.[0];
		await act(async () => {
			await createProps.onSave({
				title: "New",
				startDate: new Date("2026-01-02T09:00:00"),
				endDate: new Date("2026-01-02T10:00:00"),
				attendee: "[]",
				status: "booked",
				durationHours: 1,
			});
		});
		expect(onEventCreate).toHaveBeenCalled();
		expect(onToast).toHaveBeenCalledWith(
			"Event created successfully",
			"success",
		);

		await user.click(screen.getByRole("button", { name: "open-edit" }));
		const updateProps = modalPropsSpy.mock.calls.at(-1)?.[0];
		await act(async () => {
			await updateProps.onSave({
				title: "Updated",
				startDate: new Date("2026-01-02T09:00:00"),
				endDate: new Date("2026-01-02T10:00:00"),
				attendee: "[]",
				status: "booked",
				durationHours: 1,
			});
		});
		expect(onEventUpdate).toHaveBeenCalledWith(
			"e1",
			expect.objectContaining({ title: "Updated" }),
		);
		expect(onToast).toHaveBeenCalledWith(
			"Event updated successfully",
			"success",
		);

		await act(async () => {
			await updateProps.onDelete();
		});
		expect(onEventDelete).toHaveBeenCalledWith("e1");
		expect(onToast).toHaveBeenCalledWith(
			"Event deleted successfully",
			"success",
		);
	});

	it("ignores delete when no event is selected", async () => {
		modalPropsSpy.mockClear();
		const onEventCreate = vi.fn().mockResolvedValue(undefined);
		const onEventUpdate = vi.fn().mockResolvedValue(undefined);
		const onEventDelete = vi.fn().mockResolvedValue(undefined);

		render(
			<ScheduleManager
				events={[]}
				resources={[]}
				groups={[]}
				settings={{
					defaultDuration: 1,
					startTime: "08:00",
					endTime: "18:00",
					closedDays: [],
					weekStartsOn: 0,
				}}
				isLoading={false}
				onEventCreate={onEventCreate}
				onEventUpdate={onEventUpdate}
				onEventDelete={onEventDelete}
			/>,
		);

		await act(async () => {
			await modalPropsSpy.mock.calls.at(-1)?.[0].onDelete();
		});

		expect(onEventDelete).not.toHaveBeenCalled();
	});

	it("handles save and delete errors", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const onEventCreate = vi.fn().mockRejectedValue(new Error("create fail"));
		const onEventUpdate = vi.fn().mockRejectedValue(new Error("fail"));
		const onEventDelete = vi.fn().mockRejectedValue(new Error("fail"));
		const onToast = vi.fn();

		render(
			<ScheduleManager
				events={[]}
				resources={[]}
				groups={[]}
				settings={{
					defaultDuration: 1,
					startTime: "08:00",
					endTime: "18:00",
					closedDays: [],
					weekStartsOn: 0,
				}}
				isLoading={false}
				onEventCreate={onEventCreate}
				onEventUpdate={onEventUpdate}
				onEventDelete={onEventDelete}
				onToast={onToast}
			/>,
		);

		await act(async () => {
			await modalPropsSpy.mock.calls.at(-1)?.[0].onDelete();
		});

		await act(async () => {
			await modalPropsSpy.mock.calls.at(-1)?.[0].onSave({
				title: "Create Fail",
				startDate: new Date("2026-01-02T09:00:00"),
				endDate: new Date("2026-01-02T10:00:00"),
				attendee: "[]",
				status: "booked",
				durationHours: 1,
			});
		});
		expect(onToast).toHaveBeenCalledWith("Failed to save event", "error");

		await act(async () => {
			await calendarPropsSpy.mock.calls.at(-1)?.[0].onEventClick({
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
			});
		});

		await act(async () => {
			await modalPropsSpy.mock.calls.at(-1)?.[0].onSave({
				title: "Fail",
				startDate: new Date("2026-01-02T09:00:00"),
				endDate: new Date("2026-01-02T10:00:00"),
				attendee: "[]",
				status: "booked",
				durationHours: 1,
			});
		});
		expect(onToast).toHaveBeenCalledWith("Failed to save event", "error");

		await act(async () => {
			await modalPropsSpy.mock.calls.at(-1)?.[0].onDelete();
		});

		await act(async () => {
			await modalPropsSpy.mock.calls.at(-1)?.[0].onDelete();
		});
		expect(onToast).toHaveBeenCalledWith("Failed to delete event", "error");
		expect(errorSpy).toHaveBeenCalled();
		errorSpy.mockRestore();
	});
});
