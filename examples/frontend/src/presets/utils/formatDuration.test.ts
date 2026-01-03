import { describe, expect, it } from "vitest";
import { formatDuration, parseDuration } from "./formatDuration";

describe("formatDuration", () => {
	describe("formatDuration", () => {
		it("formats hours only", () => {
			expect(formatDuration(1)).toBe("1h");
			expect(formatDuration(2)).toBe("2h");
			expect(formatDuration(0.5)).toBe("30m");
		});

		it("formats minutes only", () => {
			expect(formatDuration(0)).toBe("0m");
			expect(formatDuration(0.25)).toBe("15m");
			expect(formatDuration(0.5)).toBe("30m");
			expect(formatDuration(0.75)).toBe("45m");
		});

		it("formats hours and minutes", () => {
			expect(formatDuration(1.5)).toBe("1h 30m");
			expect(formatDuration(2.25)).toBe("2h 15m");
			expect(formatDuration(3.75)).toBe("3h 45m");
		});

		it("rounds minutes correctly", () => {
			expect(formatDuration(1.51)).toBe("1h 31m");
			expect(formatDuration(1.49)).toBe("1h 29m");
		});

		it("handles large values", () => {
			expect(formatDuration(24)).toBe("24h");
			expect(formatDuration(24.5)).toBe("24h 30m");
		});
	});

	describe("parseDuration", () => {
		it("parses hours only", () => {
			expect(parseDuration("1h")).toBe(1);
			expect(parseDuration("2h")).toBe(2);
			expect(parseDuration("24h")).toBe(24);
		});

		it("parses minutes only", () => {
			expect(parseDuration("30m")).toBe(0.5);
			expect(parseDuration("15m")).toBe(0.25);
			expect(parseDuration("45m")).toBe(0.75);
		});

		it("parses hours and minutes", () => {
			expect(parseDuration("1h 30m")).toBe(1.5);
			expect(parseDuration("2h 15m")).toBe(2.25);
			expect(parseDuration("3h 45m")).toBe(3.75);
		});

		it("handles only hours", () => {
			expect(parseDuration("1h")).toBe(1);
		});

		it("handles only minutes", () => {
			expect(parseDuration("30m")).toBe(0.5);
		});

		it("handles zero values", () => {
			expect(parseDuration("0h 0m")).toBe(0);
		});

		it("handles different formats", () => {
			expect(parseDuration("1h30m")).toBe(1.5);
			expect(parseDuration("2h  30m")).toBe(2.5);
		});
	});

	describe("format and parse round trip", () => {
		it("maintains values through round trip", () => {
			const values = [0, 0.25, 0.5, 0.75, 1, 1.5, 2, 2.25, 3.75, 24];
			values.forEach((value) => {
				const formatted = formatDuration(value);
				const parsed = parseDuration(formatted);
				expect(parsed).toBeCloseTo(value, 0);
			});
		});
	});
});
