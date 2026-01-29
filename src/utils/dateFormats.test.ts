import { describe, expect, it } from "vitest";
import { formatCalendarDate } from "./dateFormats";

describe("formatCalendarDate", () => {
	const date = new Date("2026-01-15T12:34:56Z");

	it("returns strings for all supported formats", () => {
		const types = [
			"header",
			"picker",
			"weekday",
			"weekdayShort",
			"day",
			"full",
			"yearMonth",
			"monthDay",
			"monthDayShort",
			"compact",
			"time",
			"timeWithSeconds",
			"timeWithMs",
			"time12",
			"time24",
			"year",
			"month",
			"monthShort",
			"minute",
			"second",
		] as const;

		for (const type of types) {
			const value = formatCalendarDate(date, "en-US", type);
			expect(typeof value).toBe("string");
			expect(value.length).toBeGreaterThan(0);
		}
	});

	it("applies Japanese-specific weekday formatting", () => {
		const weekdayJa = formatCalendarDate(date, "ja", "weekday");
		expect(weekdayJa.startsWith("(")).toBe(true);
		expect(weekdayJa.endsWith(")")).toBe(true);

		const fullJa = formatCalendarDate(date, "ja", "full");
		expect(fullJa.includes("(")).toBe(true);
		expect(fullJa.includes(")")).toBe(true);
	});
});
