import { describe, expect, it } from "vitest";
import {
	DAY_VIEW,
	MONTH_VIEW,
	PAGINATION,
	TRANSITION,
	WEEK_VIEW,
} from "./constants";

describe("FacilitySchedule Constants", () => {
	describe("DAY_VIEW", () => {
		it("has correct slot height", () => {
			expect(DAY_VIEW.SLOT_HEIGHT).toBe(60);
		});

		it("has correct header height", () => {
			expect(DAY_VIEW.HEADER_HEIGHT).toBe(64);
		});

		it("has correct time column width", () => {
			expect(DAY_VIEW.TIME_COLUMN_WIDTH).toBe(64);
		});

		it("has correct resource column min width", () => {
			expect(DAY_VIEW.RESOURCE_COLUMN_MIN_WIDTH).toBe(120);
		});
	});

	describe("WEEK_VIEW", () => {
		it("has correct day cell height", () => {
			expect(WEEK_VIEW.DAY_CELL_HEIGHT).toBe(110);
		});

		it("has correct date column width", () => {
			expect(WEEK_VIEW.DATE_COLUMN_WIDTH).toBe(56);
		});

		it("has correct resource min width", () => {
			expect(WEEK_VIEW.RESOURCE_MIN_WIDTH).toBe(80);
		});

		it("has correct max visible events", () => {
			expect(WEEK_VIEW.MAX_VISIBLE_EVENTS).toBe(4);
		});
	});

	describe("MONTH_VIEW", () => {
		it("has correct day cell min height", () => {
			expect(MONTH_VIEW.DAY_CELL_MIN_HEIGHT).toBe(100);
		});

		it("has correct legend bar height", () => {
			expect(MONTH_VIEW.LEGEND_BAR_HEIGHT).toBe(40);
		});
	});

	describe("PAGINATION", () => {
		it("has correct items per page", () => {
			expect(PAGINATION.ITEMS_PER_PAGE).toBe(10);
		});
	});

	describe("TRANSITION", () => {
		it("has correct duration", () => {
			expect(TRANSITION.DURATION).toBe(200);
		});
	});
});
