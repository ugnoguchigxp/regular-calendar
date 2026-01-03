import { describe, expect, it } from "vitest";
import type { ScheduleEvent } from "regular-calendar";
import {
	cleanEventId,
	formatEventTitleWithAttendees,
	mergeEvents,
	parseAttendeeNames,
	resolveEventOwnerId,
} from "./eventHelpers";

describe("eventHelpers", () => {
	describe("mergeEvents", () => {
		const globalEvents: ScheduleEvent[] = [
			{
				id: "e1",
				resourceId: "r1",
				groupId: "g1",
				title: "Global Event 1",
				attendee: "[]",
				startDate: new Date("2025-01-01T10:00:00"),
				endDate: new Date("2025-01-01T12:00:00"),
				status: "booked",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: "e2",
				resourceId: "r2",
				groupId: "g1",
				title: "Global Event 2",
				attendee: "[]",
				startDate: new Date("2025-01-01T14:00:00"),
				endDate: new Date("2025-01-01T16:00:00"),
				status: "booked",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		];

		const additionalEvents: ScheduleEvent[] = [
			{
				id: "e1",
				resourceId: "r1",
				groupId: "g1",
				title: "Colored Event 1",
				attendee: '[{"name": "John"}]',
				color: "#ff0000",
				startDate: new Date("2025-01-01T10:00:00"),
				endDate: new Date("2025-01-01T12:00:00"),
				status: "booked",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: "e3",
				resourceId: "r3",
				groupId: "g1",
				title: "Colored Event 3",
				attendee: '[{"name": "Jane"}]',
				color: "#00ff00",
				startDate: new Date("2025-01-01T09:00:00"),
				endDate: new Date("2025-01-01T11:00:00"),
				status: "booked",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		];

		it("should merge global and additional events", () => {
			const result = mergeEvents(globalEvents, additionalEvents);

			expect(result).toHaveLength(3);
			expect(result.some((e) => e.id === "e1")).toBe(true);
			expect(result.some((e) => e.id === "e2")).toBe(true);
			expect(result.some((e) => e.id === "e3")).toBe(true);
		});

		it("should override global events with additional events", () => {
			const result = mergeEvents(globalEvents, additionalEvents);

			const event1 = result.find((e) => e.id === "e1");
			expect(event1?.title).toBe("Colored Event 1");
			expect(event1?.color).toBe("#ff0000");
		});

		it("should keep global events without attendees", () => {
			const result = mergeEvents(globalEvents, additionalEvents);

			const event2 = result.find((e) => e.id === "e2");
			expect(event2?.title).toBe("Global Event 2");
		});

		it("should not include global events with attendees", () => {
			const globalWithAttendees: ScheduleEvent[] = [
				{
					id: "e1",
					resourceId: "r1",
					groupId: "g1",
					title: "Global Event 1",
					attendee: '[{"name": "John"}]',
					startDate: new Date("2025-01-01T10:00:00"),
					endDate: new Date("2025-01-01T12:00:00"),
					status: "booked",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			const additionalWithAttendees: ScheduleEvent[] = [
				{
					id: "e2",
					resourceId: "r2",
					groupId: "g1",
					title: "Additional Event 2",
					attendee: '[{"name": "Jane"}]',
					startDate: new Date("2025-01-01T14:00:00"),
					endDate: new Date("2025-01-01T16:00:00"),
					status: "booked",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			const result = mergeEvents(globalWithAttendees, additionalWithAttendees);

			expect(result).toHaveLength(1);
			expect(result.every((e) => e.id !== "e1")).toBe(true);
			expect(result[0].id).toBe("e2");
		});

		it("should handle empty additional events", () => {
			const result = mergeEvents(globalEvents, []);

			expect(result).toHaveLength(2);
			expect(result[0].title).toBe("Global Event 1");
			expect(result[1].title).toBe("Global Event 2");
		});

		it("should handle empty global events", () => {
			const result = mergeEvents([], additionalEvents);

			expect(result).toHaveLength(2);
		});

		it("should set isAllDay correctly when undefined", () => {
			const globalWithoutAllDay: ScheduleEvent[] = [
				{
					id: "e1",
					resourceId: "r1",
					groupId: "g1",
					title: "Global Event 1",
					attendee: "[]",
					startDate: new Date("2025-01-01T10:00:00"),
					endDate: new Date("2025-01-01T12:00:00"),
					status: "booked",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			const result = mergeEvents(globalWithoutAllDay, []);

			expect(result[0].isAllDay).toBe(false);
		});

		it("should set isAllDay from extendedProps", () => {
			const globalWithExtendedProps: ScheduleEvent[] = [
				{
					id: "e1",
					resourceId: "r1",
					groupId: "g1",
					title: "Global Event 1",
					attendee: "[]",
					startDate: new Date("2025-01-01T10:00:00"),
					endDate: new Date("2025-01-01T12:00:00"),
					status: "booked",
					extendedProps: { isAllDay: true },
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			const result = mergeEvents(globalWithExtendedProps, []);

			expect(result[0].isAllDay).toBe(true);
		});
	});

	describe("resolveEventOwnerId", () => {
		it("should resolve ownerId from extendedProps", () => {
			const extendedProps = { ownerId: "p1", custom: "value" };

			const result = resolveEventOwnerId(extendedProps, undefined);

			expect(result).toBe("p1");
		});

		it("should resolve personnelId from extendedProps", () => {
			const extendedProps = { personnelId: "p2", custom: "value" };

			const result = resolveEventOwnerId(extendedProps, undefined);

			expect(result).toBe("p2");
		});

		it("should resolve ownerId from attendee JSON", () => {
			const extendedProps = {};
			const attendeeJson = '[{"name": "John", "personnelId": "p1"}]';

			const result = resolveEventOwnerId(extendedProps, attendeeJson);

			expect(result).toBe("p1");
		});

		it("should prioritize extendedProps over attendee JSON", () => {
			const extendedProps = { ownerId: "p1" };
			const attendeeJson = '[{"name": "John", "personnelId": "p2"}]';

			const result = resolveEventOwnerId(extendedProps, attendeeJson);

			expect(result).toBe("p1");
		});

		it("should return undefined when no owner found", () => {
			const extendedProps = {};
			const attendeeJson = '[{"name": "John"}]';

			const result = resolveEventOwnerId(extendedProps, attendeeJson);

			expect(result).toBeUndefined();
		});

		it("should handle empty attendee JSON", () => {
			const extendedProps = {};
			const attendeeJson = "[]";

			const result = resolveEventOwnerId(extendedProps, attendeeJson);

			expect(result).toBeUndefined();
		});

		it("should handle invalid attendee JSON", () => {
			const extendedProps = {};
			const attendeeJson = "invalid";

			const result = resolveEventOwnerId(extendedProps, attendeeJson);

			expect(result).toBeUndefined();
		});

		it("should handle undefined extendedProps and attendeeJson", () => {
			const result = resolveEventOwnerId(undefined, undefined);

			expect(result).toBeUndefined();
		});
	});

	describe("cleanEventId", () => {
		it("should clean split event ID", () => {
			const event: ScheduleEvent = {
				id: "event1_user2",
				resourceId: "r1",
				groupId: "g1",
				title: "Event 1",
				attendee: "[]",
				startDate: new Date("2025-01-01T10:00:00"),
				endDate: new Date("2025-01-01T12:00:00"),
				status: "booked",
				extendedProps: { realId: "event1" },
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = cleanEventId(event);

			expect(result.id).toBe("event1");
		});

		it("should keep original ID if no realId in extendedProps", () => {
			const event: ScheduleEvent = {
				id: "event1_user2",
				resourceId: "r1",
				groupId: "g1",
				title: "Event 1",
				attendee: "[]",
				startDate: new Date("2025-01-01T10:00:00"),
				endDate: new Date("2025-01-01T12:00:00"),
				status: "booked",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = cleanEventId(event);

			expect(result.id).toBe("event1_user2");
		});

		it("should preserve other event properties", () => {
			const event: ScheduleEvent = {
				id: "event1_user2",
				resourceId: "r1",
				groupId: "g1",
				title: "Event 1",
				attendee: "[]",
				startDate: new Date("2025-01-01T10:00:00"),
				endDate: new Date("2025-01-01T12:00:00"),
				status: "booked",
				extendedProps: { realId: "event1" },
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = cleanEventId(event);

			expect(result.title).toBe("Event 1");
			expect(result.resourceId).toBe("r1");
			expect(result.groupId).toBe("g1");
		});
	});

	describe("parseAttendeeNames", () => {
		it("should parse attendee JSON array", () => {
			const attendeeJson = '[{"name": "John"}, {"name": "Jane"}]';

			const result = parseAttendeeNames(attendeeJson);

			expect(result).toEqual(["John", "Jane"]);
		});

		it("should handle empty attendee array", () => {
			const attendeeJson = "[]";

			const result = parseAttendeeNames(attendeeJson);

			expect(result).toEqual([]);
		});

		it("should handle undefined attendee", () => {
			const result = parseAttendeeNames(undefined);

			expect(result).toEqual([]);
		});

		it("should filter out null names", () => {
			const attendeeJson = '[{"name": "John"}, {"name": ""}, {"name": "Jane"}]';

			const result = parseAttendeeNames(attendeeJson);

			expect(result).toEqual(["John", "Jane"]);
		});

		it("should handle legacy comma-separated format", () => {
			const attendeeJson = "John, Jane, Bob";

			const result = parseAttendeeNames(attendeeJson);

			expect(result).toEqual(["John", "Jane", "Bob"]);
		});

		it("should handle legacy Japanese comma-separated format", () => {
			const attendeeJson = "John、Jane、Bob";

			const result = parseAttendeeNames(attendeeJson);

			expect(result).toEqual(["John", "Jane", "Bob"]);
		});

		it("should trim whitespace in legacy format", () => {
			const attendeeJson = " John , Jane , Bob ";

			const result = parseAttendeeNames(attendeeJson);

			expect(result).toEqual(["John", "Jane", "Bob"]);
		});

		it("should handle invalid JSON", () => {
			const attendeeJson = "invalid json";

			const result = parseAttendeeNames(attendeeJson);

			expect(result).toEqual(["invalid json"]);
		});

		it("should handle missing name field", () => {
			const attendeeJson = '[{"id": "1"}, {"name": "Jane"}]';

			const result = parseAttendeeNames(attendeeJson);

			expect(result).toEqual(["Jane"]);
		});
	});

	describe("formatEventTitleWithAttendees", () => {
		it("should append attendees to title", () => {
			const title = "Meeting";
			const attendeeJson = '[{"name": "John"}, {"name": "Jane"}]';

			const result = formatEventTitleWithAttendees(title, attendeeJson);

			expect(result).toBe("Meeting (John, Jane)");
		});

		it("should keep original title without attendees", () => {
			const title = "Meeting";
			const attendeeJson = "[]";

			const result = formatEventTitleWithAttendees(title, attendeeJson);

			expect(result).toBe("Meeting");
		});

		it("should handle undefined attendee", () => {
			const title = "Meeting";

			const result = formatEventTitleWithAttendees(title, undefined);

			expect(result).toBe("Meeting");
		});

		it("should handle single attendee", () => {
			const title = "Meeting";
			const attendeeJson = '[{"name": "John"}]';

			const result = formatEventTitleWithAttendees(title, attendeeJson);

			expect(result).toBe("Meeting (John)");
		});

		it("should handle many attendees", () => {
			const title = "Conference";
			const attendeeJson =
				'[{"name": "John"}, {"name": "Jane"}, {"name": "Bob"}, {"name": "Alice"}]';

			const result = formatEventTitleWithAttendees(title, attendeeJson);

			expect(result).toBe("Conference (John, Jane, Bob, Alice)");
		});

		it("should use parseAttendeeNames internally", () => {
			const title = "Meeting";
			const attendeeJson = "John, Jane";

			const result = formatEventTitleWithAttendees(title, attendeeJson);

			expect(result).toBe("Meeting (John, Jane)");
		});
	});
});
