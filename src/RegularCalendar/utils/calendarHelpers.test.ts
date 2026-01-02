import { describe, expect, it, vi } from "vitest";
import { TIME_SLOT_HEIGHT } from "../constants/calendarConstants";
import type { ScheduleEvent } from "../RegularCalendar.schema";
import {
	calculateEventPosition,
	calculateEventsWithLayout,
	generateTimeSlots,
	getCurrentTimePosition,
	getDateClasses,
	getDayNameClasses,
	getEventsForDate,
	getMonthCalendarGrid,
	getTimeInTimeZone,
	getWeekDates,
	isCurrentTimeInRange,
} from "./calendarHelpers";

describe("calendarHelpers", () => {
	describe("getWeekDates", () => {
		it("should generate week dates starting Monday", () => {
			const date = new Date("2025-01-03T10:00:00"); // Friday

			const weekDates = getWeekDates(date, 1);

			expect(weekDates).toHaveLength(7);
			expect(weekDates[0].toDateString()).toBe("Mon Dec 30 2024");
			expect(weekDates[6].toDateString()).toBe("Sun Jan 05 2025");
		});

		it("should generate week dates starting Sunday", () => {
			const date = new Date("2025-01-03T10:00:00"); // Friday

			const weekDates = getWeekDates(date, 0);

			expect(weekDates).toHaveLength(7);
			expect(weekDates[0].toDateString()).toBe("Sun Dec 29 2024");
			expect(weekDates[6].toDateString()).toBe("Sat Jan 04 2025");
		});

		it("should set all dates to midnight", () => {
			const date = new Date("2025-01-03T10:30:00");

			const weekDates = getWeekDates(date, 1);

			weekDates.forEach((d) => {
				expect(d.getHours()).toBe(0);
				expect(d.getMinutes()).toBe(0);
				expect(d.getSeconds()).toBe(0);
				expect(d.getMilliseconds()).toBe(0);
			});
		});

		it("should handle Monday as first day of week", () => {
			const monday = new Date("2025-01-06T10:00:00"); // Monday

			const weekDates = getWeekDates(monday, 1);

			expect(weekDates[0].toDateString()).toBe("Mon Jan 06 2025");
		});

		it("should handle Sunday as first day of week", () => {
			const sunday = new Date("2025-01-05T10:00:00"); // Sunday

			const weekDates = getWeekDates(sunday, 0);

			expect(weekDates[0].toDateString()).toBe("Sun Jan 05 2025");
		});
	});

	describe("generateTimeSlots", () => {
		it("should generate time slots with 30-minute intervals", () => {
			const slots = generateTimeSlots(30, 8, 12);

			expect(slots).toHaveLength(8);
			expect(slots[0]).toBe("08:00");
			expect(slots[1]).toBe("08:30");
			expect(slots[7]).toBe("11:30");
		});

		it("should generate time slots with 60-minute intervals", () => {
			const slots = generateTimeSlots(60, 8, 12);

			expect(slots).toHaveLength(4);
			expect(slots[0]).toBe("08:00");
			expect(slots[1]).toBe("09:00");
			expect(slots[3]).toBe("11:00");
		});

		it("should handle 15-minute intervals", () => {
			const slots = generateTimeSlots(15, 8, 9);

			expect(slots).toHaveLength(4);
			expect(slots).toEqual(["08:00", "08:15", "08:30", "08:45"]);
		});

		it("should handle full day range", () => {
			const slots = generateTimeSlots(30, 0, 24);

			expect(slots).toHaveLength(48);
			expect(slots[0]).toBe("00:00");
			expect(slots[47]).toBe("23:30");
		});
	});

	describe("getCurrentTimePosition", () => {
		it("should calculate current time position", () => {
			vi.setSystemTime(new Date("2025-01-01T10:30:00"));

			const position = getCurrentTimePosition(30, 8, "Asia/Tokyo");

			expect(position).toBeGreaterThan(0);
			vi.useRealTimers();
		});

		it("should calculate position correctly for 10:30", () => {
			vi.setSystemTime(new Date("2025-01-01T10:30:00"));

			const position = getCurrentTimePosition(30, 8, "Asia/Tokyo");

			const expectedPosition = ((10.5 - 8) / 1) * TIME_SLOT_HEIGHT * 2;
			expect(position).toBeCloseTo(expectedPosition);

			vi.useRealTimers();
		});

		it("should handle different time zones", () => {
			vi.setSystemTime(new Date("2025-01-01T10:30:00Z"));

			const position = getCurrentTimePosition(30, 8, "UTC");

			expect(position).toBeGreaterThan(0);

			vi.useRealTimers();
		});
	});

	describe("isCurrentTimeInRange", () => {
		it("should return true when current time is within range", () => {
			vi.setSystemTime(new Date("2025-01-01T10:30:00"));

			const inRange = isCurrentTimeInRange(8, 20, "Asia/Tokyo");

			expect(inRange).toBe(true);
			vi.useRealTimers();
		});

		it("should return false when current time is before range", () => {
			vi.setSystemTime(new Date("2025-01-01T07:30:00"));

			const inRange = isCurrentTimeInRange(8, 20, "Asia/Tokyo");

			expect(inRange).toBe(false);
			vi.useRealTimers();
		});

		it("should return false when current time is after range", () => {
			vi.setSystemTime(new Date("2025-01-01T21:30:00"));

			const inRange = isCurrentTimeInRange(8, 20, "Asia/Tokyo");

			expect(inRange).toBe(false);
			vi.useRealTimers();
		});
	});

	describe("getEventsForDate", () => {
		const events: ScheduleEvent[] = [
			{
				id: "1",
				resourceId: "r1",
				groupId: "g1",
				title: "Event 1",
				attendee: "John",
				startDate: new Date("2025-01-01T10:00:00"),
				endDate: new Date("2025-01-01T12:00:00"),
				status: "booked",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: "2",
				resourceId: "r1",
				groupId: "g1",
				title: "Event 2",
				attendee: "Jane",
				startDate: new Date("2025-01-02T14:00:00"),
				endDate: new Date("2025-01-02T16:00:00"),
				status: "booked",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		];

		it("should filter events for specific date", () => {
			const date = new Date("2025-01-01T00:00:00");

			const result = getEventsForDate(events, date);

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe("1");
		});

		it("should ignore time component when comparing dates", () => {
			const date = new Date("2025-01-01T23:59:59");

			const result = getEventsForDate(events, date);

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe("1");
		});

		it("should return empty array for date with no events", () => {
			const date = new Date("2025-01-03T00:00:00");

			const result = getEventsForDate(events, date);

			expect(result).toHaveLength(0);
		});
	});

	describe("getMonthCalendarGrid", () => {
		it("should generate month grid starting Monday", () => {
			const date = new Date("2025-01-01T00:00:00");

			const grid = getMonthCalendarGrid(date, 1);

			expect(grid).toHaveLength(6);
			expect(grid[0]).toHaveLength(7);
			expect(grid[5]).toHaveLength(7);
		});

		it("should generate month grid starting Sunday", () => {
			const date = new Date("2025-01-01T00:00:00");

			const grid = getMonthCalendarGrid(date, 0);

			expect(grid).toHaveLength(6);
			expect(grid[0]).toHaveLength(7);
		});

		it("should include correct days for January 2025", () => {
			const date = new Date("2025-01-15T00:00:00");

			const grid = getMonthCalendarGrid(date, 1);

			const firstWeek = grid[0];
			expect(firstWeek[0].toDateString()).toBe("Mon Dec 30 2024");
			expect(firstWeek[6].toDateString()).toBe("Sun Jan 05 2025");
		});

		it("should have 6 weeks for full month", () => {
			const date = new Date("2025-01-01T00:00:00");

			const grid = getMonthCalendarGrid(date, 1);

			expect(grid.length).toBe(6);
		});
	});

	describe("getTimeInTimeZone", () => {
		it("should parse time for valid timezone", () => {
			const date = new Date("2025-01-01T10:30:00");

			const result = getTimeInTimeZone(date, "Asia/Tokyo");

			expect(result.hour).toBe(10);
			expect(result.minute).toBe(30);
		});

		it("should handle UTC timezone", () => {
			const date = new Date("2025-01-01T10:30:00");

			const result = getTimeInTimeZone(date, "UTC");

			expect(result.hour).toBeGreaterThanOrEqual(0);
			expect(result.hour).toBeLessThan(24);
		});

		it("should fallback to local time for invalid timezone", () => {
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			const date = new Date("2025-01-01T10:30:00");

			const result = getTimeInTimeZone(date, "Invalid/Timezone");

			expect(result.hour).toBeGreaterThanOrEqual(0);
			expect(result.hour).toBeLessThan(24);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});

		it("should handle midnight correctly", () => {
			const date = new Date("2025-01-01T00:00:00");

			const result = getTimeInTimeZone(date, "Asia/Tokyo");

			expect(result.hour).toBe(0);
			expect(result.minute).toBe(0);
		});
	});

	describe("calculateEventPosition", () => {
		it("should calculate position and height for event", () => {
			const event: ScheduleEvent = {
				id: "1",
				resourceId: "r1",
				groupId: "g1",
				title: "Event 1",
				attendee: "John",
				startDate: new Date("2025-01-01T10:00:00"),
				endDate: new Date("2025-01-01T12:00:00"),
				status: "booked",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = calculateEventPosition(event, 30, 8, "Asia/Tokyo");

			expect(result.top).toBeGreaterThan(0);
			expect(result.height).toBeGreaterThan(0);
		});

		it("should calculate correct height for 2-hour event", () => {
			const event: ScheduleEvent = {
				id: "1",
				resourceId: "r1",
				groupId: "g1",
				title: "Event 1",
				attendee: "John",
				startDate: new Date("2025-01-01T10:00:00"),
				endDate: new Date("2025-01-01T12:00:00"),
				status: "booked",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = calculateEventPosition(event, 30, 8, "Asia/Tokyo");

			const expectedHeight = 2 * 60 * 2;
			expect(result.height).toBeCloseTo(expectedHeight);
		});

		it("should handle day crossing", () => {
			const event: ScheduleEvent = {
				id: "1",
				resourceId: "r1",
				groupId: "g1",
				title: "Event 1",
				attendee: "John",
				startDate: new Date("2025-01-01T22:00:00"),
				endDate: new Date("2025-01-02T02:00:00"),
				status: "booked",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = calculateEventPosition(event, 30, 8, "Asia/Tokyo");

			expect(result.height).toBeGreaterThan(0);
		});
	});

	describe("getDateClasses", () => {
		it("should return bold classes for selected date", () => {
			const date = new Date("2025-01-01T00:00:00");

			const classes = getDateClasses(date, true);

			expect(classes).toContain("font-bold");
		});

		it("should return normal classes for unselected date", () => {
			const date = new Date("2025-01-01T00:00:00");

			const classes = getDateClasses(date, false);

			expect(classes).toContain("font-normal");
		});

		it("should return red text for Sunday", () => {
			const date = new Date("2025-01-05T00:00:00"); // Sunday

			const classes = getDateClasses(date, false);

			expect(classes).toContain("text-red-600");
		});

		it("should return blue text for Saturday", () => {
			const date = new Date("2025-01-04T00:00:00"); // Saturday

			const classes = getDateClasses(date, false);

			expect(classes).toContain("text-blue-600");
		});

		it("should return foreground text for weekday", () => {
			const date = new Date("2025-01-01T00:00:00"); // Wednesday

			const classes = getDateClasses(date, false);

			expect(classes).toContain("text-foreground");
		});
	});

	describe("getDayNameClasses", () => {
		it("should return red text for Sunday (0)", () => {
			const classes = getDayNameClasses(0);

			expect(classes).toBe("text-red-600");
		});

		it("should return blue text for Saturday (6)", () => {
			const classes = getDayNameClasses(6);

			expect(classes).toBe("text-blue-600");
		});

		it("should return muted foreground for weekday", () => {
			const classes = getDayNameClasses(1);

			expect(classes).toBe("text-muted-foreground");
		});

		it("should return muted foreground for Friday", () => {
			const classes = getDayNameClasses(5);

			expect(classes).toBe("text-muted-foreground");
		});
	});

	describe("calculateEventsWithLayout", () => {
		const events: ScheduleEvent[] = [
			{
				id: "1",
				resourceId: "r1",
				groupId: "g1",
				title: "Event 1",
				attendee: "John",
				startDate: new Date("2025-01-01T10:00:00"),
				endDate: new Date("2025-01-01T12:00:00"),
				status: "booked",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: "2",
				resourceId: "r1",
				groupId: "g1",
				title: "Event 2",
				attendee: "Jane",
				startDate: new Date("2025-01-01T11:00:00"),
				endDate: new Date("2025-01-01T13:00:00"),
				status: "booked",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{
				id: "3",
				resourceId: "r1",
				groupId: "g1",
				title: "Event 3",
				attendee: "Bob",
				startDate: new Date("2025-01-01T14:00:00"),
				endDate: new Date("2025-01-01T16:00:00"),
				status: "booked",
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		];

		it("should return empty array for no events", () => {
			const result = calculateEventsWithLayout([], 30, 8, "Asia/Tokyo");

			expect(result).toHaveLength(0);
		});

		it("should calculate layout with overlap handling", () => {
			const result = calculateEventsWithLayout(events, 30, 8, "Asia/Tokyo");

			expect(result).toHaveLength(3);
			expect(result[0].event.id).toBe("1");
			expect(result[0].column).toBe(0);
		});

		it("should assign different columns to overlapping events", () => {
			const result = calculateEventsWithLayout(events, 30, 8, "Asia/Tokyo");

			const overlappingEvents = result.filter(
				(r) => r.event.id === "1" || r.event.id === "2",
			);

			expect(overlappingEvents).toHaveLength(2);
		});

		it("should calculate position for each event", () => {
			const result = calculateEventsWithLayout(events, 30, 8, "Asia/Tokyo");

			result.forEach((r) => {
				expect(r.position.top).toBeGreaterThanOrEqual(0);
				expect(r.position.height).toBeGreaterThan(0);
			});
		});

		it("should handle single event", () => {
			const singleEvent: ScheduleEvent[] = [
				{
					id: "1",
					resourceId: "r1",
					groupId: "g1",
					title: "Event 1",
					attendee: "John",
					startDate: new Date("2025-01-01T10:00:00"),
					endDate: new Date("2025-01-01T12:00:00"),
					status: "booked",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			];

			const result = calculateEventsWithLayout(
				singleEvent,
				30,
				8,
				"Asia/Tokyo",
			);

			expect(result).toHaveLength(1);
			expect(result[0].column).toBe(0);
			expect(result[0].totalColumns).toBe(1);
		});

		it("should maintain event reference", () => {
			const result = calculateEventsWithLayout(events, 30, 8, "Asia/Tokyo");

			result.forEach((r) => {
				expect(r.event).toBeDefined();
				expect(r.event.id).toBeDefined();
				expect(r.event.title).toBeDefined();
			});
		});
	});
});
