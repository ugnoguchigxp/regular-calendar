import { describe, expect, it } from "vitest";
import {
	generateTimeSlots,
	getDefaultSettings,
	getTimeSlot,
	isClosedDay,
} from "./timeSlotHelpers";

describe("timeSlotHelpers", () => {
	describe("generateTimeSlots", () => {
		it("should generate 4 time slots with default labels", () => {
			const slots = generateTimeSlots(4, "08:00", "20:00");

			expect(slots).toHaveLength(4);
			expect(slots[0]).toEqual({
				id: "0",
				label: "Morning",
				startTime: "08:00",
				endTime: "11:00",
			});
			expect(slots[1]).toEqual({
				id: "1",
				label: "Afternoon 1",
				startTime: "11:00",
				endTime: "14:00",
			});
			expect(slots[2]).toEqual({
				id: "2",
				label: "Afternoon 2",
				startTime: "14:00",
				endTime: "17:00",
			});
			expect(slots[3]).toEqual({
				id: "3",
				label: "Night",
				startTime: "17:00",
				endTime: "20:00",
			});
		});

		it("should generate custom number of slots", () => {
			const slots = generateTimeSlots(3, "08:00", "20:00");

			expect(slots).toHaveLength(3);
			expect(slots[0].label).toBe("Morning");
			expect(slots[1].label).toBe("Afternoon");
			expect(slots[2].label).toBe("Evening");
		});

		it("should handle more than 4 slots", () => {
			const slots = generateTimeSlots(5, "08:00", "20:00");

			expect(slots).toHaveLength(5);
			expect(slots[4].label).toBe("Slot 5");
		});

		it("should use custom time slots when provided", () => {
			const customSlots = [
				{ id: "1", label: "Custom 1", startTime: "08:00", endTime: "12:00" },
				{ id: "2", label: "Custom 2", startTime: "12:00", endTime: "16:00" },
				{ id: "3", label: "Custom 3", startTime: "16:00", endTime: "20:00" },
			];

			const slots = generateTimeSlots(3, "08:00", "20:00", customSlots);

			expect(slots).toEqual(customSlots);
		});

		it("should not use custom slots when count does not match", () => {
			const customSlots = [
				{ id: "1", label: "Custom 1", startTime: "08:00", endTime: "12:00" },
				{ id: "2", label: "Custom 2", startTime: "12:00", endTime: "16:00" },
			];

			const slots = generateTimeSlots(3, "08:00", "20:00", customSlots);

			expect(slots).not.toEqual(customSlots);
			expect(slots).toHaveLength(3);
		});

		it("should calculate correct slot durations", () => {
			const slots = generateTimeSlots(4, "06:00", "18:00");

			const slot1Duration =
				parseInt(slots[0].endTime.split(":")[0], 10) -
				parseInt(slots[0].startTime.split(":")[0], 10);
			const slot2Duration =
				parseInt(slots[1].endTime.split(":")[0], 10) -
				parseInt(slots[1].startTime.split(":")[0], 10);
			const slot3Duration =
				parseInt(slots[2].endTime.split(":")[0], 10) -
				parseInt(slots[2].startTime.split(":")[0], 10);
			const slot4Duration =
				parseInt(slots[3].endTime.split(":")[0], 10) -
				parseInt(slots[3].startTime.split(":")[0], 10);

			expect(slot1Duration).toBe(3);
			expect(slot2Duration).toBe(3);
			expect(slot3Duration).toBe(3);
			expect(slot4Duration).toBe(3);
		});

		it("should handle uneven division", () => {
			const slots = generateTimeSlots(3, "08:00", "20:00");

			const totalDuration = 12;
			const slot1Duration =
				parseInt(slots[0].endTime.split(":")[0], 10) -
				parseInt(slots[0].startTime.split(":")[0], 10);
			const slot2Duration =
				parseInt(slots[1].endTime.split(":")[0], 10) -
				parseInt(slots[1].startTime.split(":")[0], 10);
			const slot3Duration =
				parseInt(slots[2].endTime.split(":")[0], 10) -
				parseInt(slots[2].startTime.split(":")[0], 10);

			expect(slot1Duration + slot2Duration + slot3Duration).toBe(totalDuration);
		});
	});

	describe("getTimeSlot", () => {
		const timeSlots = [
			{ id: "0", label: "Morning", startTime: "08:00", endTime: "12:00" },
			{ id: "1", label: "Afternoon", startTime: "12:00", endTime: "16:00" },
			{ id: "2", label: "Evening", startTime: "16:00", endTime: "20:00" },
		];

		it("should return correct slot for time within range", () => {
			const date = new Date("2025-01-01T10:30:00");
			const slot = getTimeSlot(date, timeSlots);

			expect(slot).toEqual(timeSlots[0]);
		});

		it("should return slot at start time boundary", () => {
			const date = new Date("2025-01-01T12:00:00");
			const slot = getTimeSlot(date, timeSlots);

			expect(slot).toEqual(timeSlots[1]);
		});

		it("should return null for time before first slot", () => {
			const date = new Date("2025-01-01T07:00:00");
			const slot = getTimeSlot(date, timeSlots);

			expect(slot).toBeNull();
		});

		it("should return null for time after last slot", () => {
			const date = new Date("2025-01-01T21:00:00");
			const slot = getTimeSlot(date, timeSlots);

			expect(slot).toBeNull();
		});

		it("should return null for time at exact end boundary", () => {
			const date = new Date("2025-01-01T20:00:00");
			const slot = getTimeSlot(date, timeSlots);

			expect(slot).toBeNull();
		});

		it("should handle minute precision", () => {
			const date = new Date("2025-01-01T11:59:00");
			const slot = getTimeSlot(date, timeSlots);

			expect(slot).toEqual(timeSlots[0]);
		});

		it("should find slot in middle of range", () => {
			const date = new Date("2025-01-01T14:30:00");
			const slot = getTimeSlot(date, timeSlots);

			expect(slot).toEqual(timeSlots[1]);
		});
	});

	describe("getDefaultSettings", () => {
		it("should return default facility schedule settings", () => {
			const settings = getDefaultSettings();

			expect(settings.defaultDuration).toBe(60);
			expect(settings.startTime).toBe("08:00");
			expect(settings.endTime).toBe("20:00");
			expect(settings.closedDays).toEqual([0]);
			expect(settings.weekStartsOn).toBe(1);
		});
	});

	describe("isClosedDay", () => {
		it("should return true for closed day", () => {
			const date = new Date("2025-01-05T10:00:00"); // Sunday

			const isClosed = isClosedDay(date, [0]);

			expect(isClosed).toBe(true);
		});

		it("should return false for open day", () => {
			const date = new Date("2025-01-06T10:00:00"); // Monday

			const isClosed = isClosedDay(date, [0]);

			expect(isClosed).toBe(false);
		});

		it("should handle multiple closed days", () => {
			const sunday = new Date("2025-01-05T10:00:00"); // Sunday (0)
			const saturday = new Date("2025-01-04T10:00:00"); // Saturday (6)
			const monday = new Date("2025-01-06T10:00:00"); // Monday (1)

			expect(isClosedDay(sunday, [0, 6])).toBe(true);
			expect(isClosedDay(saturday, [0, 6])).toBe(true);
			expect(isClosedDay(monday, [0, 6])).toBe(false);
		});

		it("should handle all days closed", () => {
			const date = new Date("2025-01-06T10:00:00"); // Monday

			const isClosed = isClosedDay(date, [0, 1, 2, 3, 4, 5, 6]);

			expect(isClosed).toBe(true);
		});

		it("should handle no days closed", () => {
			const date = new Date("2025-01-05T10:00:00"); // Sunday

			const isClosed = isClosedDay(date, []);

			expect(isClosed).toBe(false);
		});

		it("should correctly identify Friday", () => {
			const date = new Date("2025-01-03T10:00:00"); // Friday (5)

			const isClosed = isClosedDay(date, [0, 6]);

			expect(isClosed).toBe(false);
		});

		it("should correctly identify Wednesday", () => {
			const date = new Date("2025-01-01T10:00:00"); // Wednesday (3)

			const isClosed = isClosedDay(date, [0, 6]);

			expect(isClosed).toBe(false);
		});
	});
});
