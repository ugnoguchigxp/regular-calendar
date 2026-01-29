import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
	Resource,
	ResourceGroup,
	ScheduleEvent,
} from "../../../FacilitySchedule/FacilitySchedule.schema";
import {
	prepareEventFormData,
	useAvailableResources,
	useConflictCheck,
	useEventForm,
	useResourceDisplayNames,
} from "./useEventForm";

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

describe("useEventForm helpers", () => {
	it("builds default values and filters attendees", () => {
		const event: ScheduleEvent = {
			id: "e1",
			title: "Meeting",
			resourceId: "r1",
			groupId: "g1",
			startDate: new Date("2026-01-02T09:00:00"),
			endDate: new Date("2026-01-02T10:00:00"),
			status: "booked",
			attendee: JSON.stringify([
				{ name: "Self", personnelId: "p1" },
				{ name: "Alice", personnelId: "p2" },
			]),
			createdAt: new Date(),
			updatedAt: new Date(),
			extendedProps: { originalTitle: "Original" },
		};

		const { result } = renderHook(() =>
			useEventForm({
				event,
				resources,
				currentUserId: "p1",
				customFields: [{ name: "notes", label: "Notes", type: "text" }],
			}),
		);

		expect(result.current.isEditMode).toBe(true);
		expect(result.current.form.getValues("title")).toBe("Original");
		expect(result.current.form.getValues("resourceId")).toBe("r1");
		expect(result.current.form.getValues("attendee")).toEqual([
			{ name: "Alice", personnelId: "p2" },
		]);
	});

	it("prepares event form data and handles all-day and custom fields", () => {
		const data = {
			title: "All Day",
			attendee: [],
			resourceId: "r1",
			startDate: "2026-01-02T09:00",
			durationHours: 2,
			status: "booked",
			note: "note",
			isAllDay: true,
			customField: "value",
		};

		const result = prepareEventFormData(
			data as any,
			undefined,
			"p1",
			[{ name: "customField", label: "Custom", type: "text" }],
		);

		expect(result.startDate.getHours()).toBe(0);
		expect(result.extendedProps?.ownerId).toBe("p1");
		expect(result.extendedProps?.customField).toBe("value");
	});

	it("checks conflicts and builds resource display names", () => {
		const startDate = "2026-01-02T09:00";
		const conflictEvent: ScheduleEvent = {
			id: "e1",
			title: "Conflict",
			resourceId: "r1",
			groupId: "g1",
			startDate: new Date("2026-01-02T09:30:00"),
			endDate: new Date("2026-01-02T10:30:00"),
			status: "booked",
			attendee: "[]",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const { result } = renderHook(() =>
			useConflictCheck(startDate, 1, "r1", [conflictEvent]),
		);
		expect(result.current).not.toBeNull();

		const { result: namesResult } = renderHook(() =>
			useResourceDisplayNames(resources, groups),
		);
		expect(namesResult.current.get("r1")).toBe("Room 1 (Group A)");
		expect(useAvailableResources(resources, [], new Date(), new Date())).toEqual(
			resources,
		);
	});

	it("returns null conflict for invalid date and handles bad attendee JSON", () => {
		const { result } = renderHook(() =>
			useConflictCheck("invalid-date", 1, "", []),
		);
		expect(result.current).toBeNull();

		const badEvent: ScheduleEvent = {
			id: "e2",
			title: "Bad",
			resourceId: "r1",
			groupId: "g1",
			startDate: new Date("2026-01-02T09:00:00"),
			endDate: new Date("2026-01-02T10:00:00"),
			status: "booked",
			attendee: "not-json",
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const { result: formResult } = renderHook(() =>
			useEventForm({
				event: badEvent,
				resources,
				currentUserId: "p1",
			}),
		);
		expect(formResult.current.form.getValues("attendee")).toEqual([]);
	});

	it("adds default attendee for demo user when missing", () => {
		const data = {
			title: "Demo",
			attendee: [],
			resourceId: "r1",
			startDate: "2026-01-02T09:00",
			durationHours: 1,
			status: "booked",
		};

		const result = prepareEventFormData(
			data as any,
			undefined,
			"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
			[],
		);

		const attendees = JSON.parse(result.attendee);
		expect(attendees[0]?.name).toBe("John Doe");
	});
});
