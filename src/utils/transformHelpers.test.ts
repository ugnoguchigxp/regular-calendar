import { describe, expect, it, vi } from "vitest";
import { getPersonnelColor } from "../PersonnelPanel/personnelColors";
import type { ScheduleEvent } from "../FacilitySchedule/FacilitySchedule.schema";
import type { ResourceAvailabilityResponse } from "../contexts/types";
import {
	cleanEventId,
	formatEventTitleWithAttendees,
	mergeEvents,
	parseAttendeeNames,
	resolveEventOwnerId,
	transformBookingsToEvents,
} from "./transformHelpers";

const baseEvent = (overrides: Partial<ScheduleEvent> = {}): ScheduleEvent =>
	({
		id: "e1",
		title: "Event",
		resourceId: "r1",
		groupId: "g1",
		startDate: new Date("2026-01-02T09:00:00"),
		endDate: new Date("2026-01-02T10:00:00"),
		status: "booked",
		attendee: "[]",
		createdAt: new Date("2026-01-02T08:00:00"),
		updatedAt: new Date("2026-01-02T08:00:00"),
		...overrides,
	} as ScheduleEvent);

describe("transformHelpers", () => {
	it("parses attendee names from JSON and legacy strings", () => {
		expect(parseAttendeeNames(undefined)).toEqual([]);
		expect(parseAttendeeNames("[]")).toEqual([]);
		expect(
			parseAttendeeNames(
				JSON.stringify([
					{ name: "Alice" },
					{ name: "Bob" },
					{ name: 123 },
					null,
				]),
			),
		).toEqual(["Alice", "Bob"]);
		expect(parseAttendeeNames("Alice, Bob、Charlie")).toEqual([
			"Alice",
			"Bob",
			"Charlie",
		]);
	});

	it("formats titles with attendees when present", () => {
		expect(formatEventTitleWithAttendees("Meeting", "[]")).toBe("Meeting");
		expect(
			formatEventTitleWithAttendees(
				"Meeting",
				JSON.stringify([{ name: "Alice" }]),
			),
		).toBe("Meeting (Alice)");
	});

	it("resolves owner from extendedProps or attendee list", () => {
		expect(resolveEventOwnerId({ ownerId: "p1" }, undefined)).toBe("p1");
		expect(resolveEventOwnerId({ personnelId: "p2" }, undefined)).toBe("p2");
		expect(
			resolveEventOwnerId(undefined, JSON.stringify([{ personnelId: "p3" }])),
		).toBe("p3");
		expect(resolveEventOwnerId(undefined, "not json")).toBeUndefined();
	});

	it("cleans event id from extendedProps", () => {
		const cleaned = cleanEventId(
			baseEvent({ id: "split_1", extendedProps: { realId: "e-real" } }),
		);
		expect(cleaned.id).toBe("e-real");
	});

	it("merges events with correct priority and all-day defaults", () => {
		const globalEvents = [
			baseEvent({ id: "e1", attendee: "[]" }),
			baseEvent({ id: "e2", attendee: JSON.stringify([{ name: "Bob" }]) }),
		];
		const additionalEvents = [
			baseEvent({ id: "e1", title: "Override", isAllDay: true }),
		];
		const merged = mergeEvents(globalEvents, additionalEvents);
		expect(merged.find((e) => e.id === "e1")?.title).toBe("Override");
		expect(merged.find((e) => e.id === "e2")).toBeUndefined();
	});

	it("transforms bookings into events with colors and parsed props", () => {
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		const availability: ResourceAvailabilityResponse[] = [
			{
				resourceId: "r1",
				resourceName: "Room 1",
				groupId: "g1",
				isAvailable: true,
				bookings: [
					{
						eventId: "e1",
						title: "Standup",
						startDate: "2026-01-02T09:00:00.000Z",
						endDate: "2026-01-02T10:00:00.000Z",
						isAllDay: false,
						attendee: JSON.stringify([{ name: "Alice", personnelId: "p1" }]),
						extendedProps: "{bad json",
					},
				],
			},
		];

		const events = transformBookingsToEvents(availability, [
			{ id: "p1", name: "Alice", priority: 1 },
		]);
		expect(events).toHaveLength(1);
		expect(events[0]?.title).toBe("Standup (Alice)");
		expect(events[0]?.color).toBe(getPersonnelColor(0));
		expect(events[0]?.extendedProps?.ownerId).toBe("p1");
		expect(warnSpy).toHaveBeenCalled();
		warnSpy.mockRestore();
	});
});
