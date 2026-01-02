import { describe, expect, it } from "vitest";
import {
	CALENDAR_COLORS,
	DEFAULT_VIEW_HOURS,
	TIME_CONSTANTS,
	TIME_SLOT_HEIGHT,
	UI_CONSTANTS,
} from "./calendarConstants";

describe("RegularCalendar Calendar Constants", () => {
	describe("TIME_SLOT_HEIGHT", () => {
		it("has correct value", () => {
			expect(TIME_SLOT_HEIGHT).toBe(60);
		});
	});

	describe("CALENDAR_COLORS", () => {
		it("has event colors defined", () => {
			expect(CALENDAR_COLORS.eventBlue).toBe("#3b82f6");
			expect(CALENDAR_COLORS.eventGreen).toBe("#10b981");
			expect(CALENDAR_COLORS.eventPurple).toBe("#8b5cf6");
			expect(CALENDAR_COLORS.eventRed).toBe("#ef4444");
			expect(CALENDAR_COLORS.eventOrange).toBe("#f97316");
		});

		it("has current time line color", () => {
			expect(CALENDAR_COLORS.currentTimeLine).toBe("#ef4444");
		});

		it("has closed day colors", () => {
			expect(CALENDAR_COLORS.closedDay).toBe("#f97316");
			expect(CALENDAR_COLORS.closedDayBg).toBe("#fed7aa");
			expect(CALENDAR_COLORS.closedDayLight).toBe("#ffedd5");
		});

		it("has weekend colors", () => {
			expect(CALENDAR_COLORS.sunday).toBe("#dc2626");
			expect(CALENDAR_COLORS.saturday).toBe("#2563eb");
		});

		it("has selection colors", () => {
			expect(CALENDAR_COLORS.selected).toBe("#dbeafe");
			expect(CALENDAR_COLORS.selectedBorder).toBe("#3b82f6");
		});

		it("has hover color", () => {
			expect(CALENDAR_COLORS.hover).toBe("#eff6ff");
		});

		it("has today color", () => {
			expect(CALENDAR_COLORS.today).toBe("#2563eb");
		});
	});

	describe("DEFAULT_VIEW_HOURS", () => {
		it("has correct start hour", () => {
			expect(DEFAULT_VIEW_HOURS.start).toBe(8);
		});

		it("has correct end hour", () => {
			expect(DEFAULT_VIEW_HOURS.end).toBe(20);
		});
	});

	describe("TIME_CONSTANTS", () => {
		it("has correct minutes per hour", () => {
			expect(TIME_CONSTANTS.MINUTES_PER_HOUR).toBe(60);
		});

		it("has correct milliseconds per minute", () => {
			expect(TIME_CONSTANTS.MILLISECONDS_PER_MINUTE).toBe(60 * 1000);
		});

		it("has correct hours per day", () => {
			expect(TIME_CONSTANTS.HOURS_PER_DAY).toBe(24);
		});

		it("has correct days per week", () => {
			expect(TIME_CONSTANTS.DAYS_PER_WEEK).toBe(7);
		});
	});

	describe("UI_CONSTANTS", () => {
		it("has correct modal vertical margin", () => {
			expect(UI_CONSTANTS.MODAL_VERTICAL_MARGIN_REM).toBe(4);
		});
	});
});
